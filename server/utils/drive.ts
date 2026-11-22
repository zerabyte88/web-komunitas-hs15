import type { DriveMediaItem, DriveFolder, DriveStats, MediaFilterOptions, MediaResponse } from '../../types/drive'

declare const useRuntimeConfig: () => {
  googleDriveApiKey?: string
  googleDriveFolderId?: string
  [key: string]: any
}
declare const $fetch: <T = any>(url: string, opts?: any) => Promise<T>

interface DriveConfig {
  apiKey: string
  folderId: string
}

let customConfig: Partial<DriveConfig> = {}

export function setRuntimeDriveConfig(config: Partial<DriveConfig>) {
  customConfig = { ...customConfig, ...config }
  clearDriveCache()
}

export function getDriveConfig(): DriveConfig {
  let runtimeConfigApiKey = ''
  let runtimeConfigFolderId = ''

  try {
    const config = useRuntimeConfig()
    runtimeConfigApiKey = (config?.googleDriveApiKey as string) || ''
    runtimeConfigFolderId = (config?.googleDriveFolderId as string) || ''
  } catch {
    // Outside Nitro request context
  }

  return {
    apiKey: customConfig.apiKey || runtimeConfigApiKey || process.env.GOOGLE_DRIVE_API_KEY || '',
    folderId: customConfig.folderId || runtimeConfigFolderId || process.env.GOOGLE_DRIVE_FOLDER_ID || ''
  }
}

// In-memory cache to stay within Google Drive API quota
interface CacheEntry<T> {
  data: T
  expiry: number
}

const cache = new Map<string, CacheEntry<any>>()
const CACHE_TTL = 2 * 60 * 1000
const MAX_FOLDER_DEPTH = 5

const PHOTO_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif', 'jfif', 'gif', 'avif', 'bmp']
const VIDEO_EXTENSIONS = ['mp4', 'mov', 'webm', 'mkv', 'avi', '3gp', 'm4v']

function getCached<T>(key: string): T | null {
  const item = cache.get(key)
  if (!item) return null
  if (Date.now() > item.expiry) {
    cache.delete(key)
    return null
  }
  return item.data
}

function setCache<T>(key: string, data: T) {
  cache.set(key, { data, expiry: Date.now() + CACHE_TTL })
}

export function clearDriveCache() {
  cache.clear()
  inFlightAllFiles = null
}

let inFlightAllFiles: Promise<{ items: DriveMediaItem[]; incomplete: boolean }> | null = null

// Retry with exponential backoff on rate limits (429/403) and transient errors
async function fetchWithRetry<T>(url: string, retries = 3): Promise<T> {
  let attempt = 0
  while (attempt < retries) {
    try {
      return await $fetch<T>(url)
    } catch (err: any) {
      attempt++
      const status = err?.status || err?.statusCode || err?.response?.status
      const isRateLimit = status === 429 || status === 403 || err?.message?.includes('Rate Limit') || err?.message?.includes('quota')
      if (attempt >= retries || (!isRateLimit && status >= 400 && status < 500 && status !== 408)) {
        throw err
      }
      const delay = Math.pow(2, attempt) * 300 + Math.random() * 200
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  throw new Error(`Failed to fetch after ${retries} attempts: ${url}`)
}

// Cap concurrency to avoid Drive API burst quota limits
async function mapConcurrent<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let index = 0

  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const i = index++
      results[i] = await fn(items[i])
    }
  })

  await Promise.all(workers)
  return results
}

async function fetchFoldersInParentResult(
  apiKey: string,
  parentId: string
): Promise<{ folders: DriveFolder[]; incomplete: boolean }> {
  const folders: DriveFolder[] = []
  let incomplete = false
  let pageToken: string | undefined = undefined

  do {
    const q = encodeURIComponent(`'${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`)
    const fields = encodeURIComponent('nextPageToken,files(id,name)')
    let url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=${fields}&key=${apiKey}&orderBy=name&pageSize=1000&supportsAllDrives=true&includeItemsFromAllDrives=true`
    if (pageToken) {
      url += `&pageToken=${encodeURIComponent(pageToken)}`
    }

    try {
      const res = await fetchWithRetry<{ nextPageToken?: string; files?: Array<{ id: string; name: string }> }>(url)
      if (res?.files?.length) {
        for (const f of res.files) {
          folders.push({ id: f.id, name: f.name })
        }
      }
      pageToken = res?.nextPageToken
    } catch (err: any) {
      console.warn(`Failed to fetch folders in parent ${parentId}:`, err.message)
      incomplete = true
      break
    }
  } while (pageToken)

  return { folders, incomplete }
}

export async function fetchFoldersInParent(apiKey: string, parentId: string): Promise<DriveFolder[]> {
  const { folders } = await fetchFoldersInParentResult(apiKey, parentId)
  return folders
}

async function fetchGoogleDriveFoldersResult(): Promise<{ folders: DriveFolder[]; incomplete: boolean }> {
  const { apiKey, folderId } = getDriveConfig()

  if (apiKey && folderId) {
    try {
      const cacheKey = `drive-folders-${folderId}`
      const cached = getCached<DriveFolder[]>(cacheKey)
      if (cached) return { folders: cached, incomplete: false }

      const { folders, incomplete } = await fetchFoldersInParentResult(apiKey, folderId)
      if (!incomplete) {
        setCache(cacheKey, folders)
      }
      return { folders, incomplete }
    } catch (err: any) {
      console.warn('Google Drive folders fetch failed:', err.message)
      return { folders: [], incomplete: true }
    }
  }

  return { folders: [], incomplete: false }
}

export async function fetchGoogleDriveFolders(): Promise<DriveFolder[]> {
  const { folders } = await fetchGoogleDriveFoldersResult()
  return folders
}

export async function fetchGoogleDriveStats(): Promise<DriveStats> {
  const { apiKey, folderId: rootFolderId } = getDriveConfig()
  const { folders, incomplete: foldersIncomplete } = await fetchGoogleDriveFoldersResult()

  if (apiKey && rootFolderId) {
    const cacheKey = `drive-stats-${rootFolderId}`
    const cachedStats = getCached<DriveStats>(cacheKey)
    if (cachedStats) return cachedStats

    const { items: allFiles, incomplete: filesIncomplete } = await getAllDriveFiles(apiKey, rootFolderId)
    const photos = allFiles.filter(item => item.type === 'photo').length
    const videos = allFiles.filter(item => item.type === 'video').length

    const stats: DriveStats = {
      photos,
      videos,
      folders: folders.length
    }
    if (!foldersIncomplete && !filesIncomplete) {
      setCache(cacheKey, stats)
    }
    return stats
  }

  return {
    photos: 0,
    videos: 0,
    folders: folders.length
  }
}

function buildMimeQuery(type?: 'photo' | 'video' | 'all'): string {
  const extClauses = (exts: string[]) => exts.map(ext => `fileExtension = '${ext}'`).join(' or ')
  if (type === 'photo') {
    return `(mimeType contains 'image/' or ${extClauses(PHOTO_EXTENSIONS)})`
  }
  if (type === 'video') {
    return `(mimeType contains 'video/' or ${extClauses(VIDEO_EXTENSIONS)})`
  }
  return `(mimeType contains 'image/' or mimeType contains 'video/' or ${extClauses([...VIDEO_EXTENSIONS, ...PHOTO_EXTENSIONS])})`
}

function mapDriveFile(f: any, albumFolderId: string, albumFolderName: string): DriveMediaItem {
  const ext = (f.fileExtension || f.name?.split('.').pop() || '').toLowerCase()
  const isVideo = f.mimeType?.includes('video') || VIDEO_EXTENSIONS.includes(ext)
  const mediaType: 'photo' | 'video' = isVideo ? 'video' : 'photo'

  let thumb = f.thumbnailLink || ''
  if (thumb && thumb.includes('=s')) {
    thumb = thumb.replace(/=s\d+/, '=s400')
  } else if (thumb) {
    thumb = `${thumb}=s400`
  } else {
    thumb = `https://lh3.googleusercontent.com/d/${f.id}=s400`
  }

  const preview = isVideo
    ? `/api/drive/video/${f.id}`
    : `https://lh3.googleusercontent.com/d/${f.id}=s0`

  const download = f.webContentLink || `https://drive.google.com/uc?export=download&id=${f.id}`

  return {
    id: f.id,
    name: f.name,
    title: f.description?.split('\n')[0] || f.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
    description: f.description || '',
    mimeType: f.mimeType || (isVideo ? 'video/mp4' : 'image/jpeg'),
    type: mediaType,
    thumbnailUrl: thumb,
    previewUrl: preview,
    downloadUrl: download,
    createdTime: f.createdTime || new Date().toISOString(),
    folderId: albumFolderId,
    folderName: albumFolderName || '',
    size: f.size ? Number(f.size) : undefined,
    width: Number(f.imageMediaMetadata?.width || f.videoMediaMetadata?.width) || undefined,
    height: Number(f.imageMediaMetadata?.height || f.videoMediaMetadata?.height) || undefined,
    durationMillis: f.videoMediaMetadata?.durationMillis ? Number(f.videoMediaMetadata.durationMillis) : undefined
  }
}

function dedupeMediaItems(items: DriveMediaItem[]): DriveMediaItem[] {
  const uniqueMap = new Map<string, DriveMediaItem>()
  for (const item of items) {
    if (!uniqueMap.has(item.id)) {
      uniqueMap.set(item.id, item)
    }
  }
  return Array.from(uniqueMap.values())
}

async function fetchDirectMediaInFolder(
  apiKey: string,
  currentFolderId: string,
  albumFolderId: string,
  albumFolderName: string,
  mimeQuery: string
): Promise<{ items: DriveMediaItem[]; incomplete: boolean }> {
  const rawItems: any[] = []
  let incomplete = false
  let pageToken: string | undefined = undefined

  do {
    const q = encodeURIComponent(`'${currentFolderId}' in parents and trashed = false and ${mimeQuery}`)
    const fields = encodeURIComponent('nextPageToken,files(id,name,mimeType,fileExtension,description,createdTime,size,imageMediaMetadata,videoMediaMetadata,thumbnailLink,webContentLink,webViewLink)')
    let url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=${fields}&key=${apiKey}&pageSize=1000&orderBy=createdTime desc&supportsAllDrives=true&includeItemsFromAllDrives=true`
    if (pageToken) {
      url += `&pageToken=${encodeURIComponent(pageToken)}`
    }

    try {
      const res = await fetchWithRetry<{ nextPageToken?: string; files?: any[] }>(url)
      if (res?.files?.length) {
        rawItems.push(...res.files)
      }
      pageToken = res?.nextPageToken
    } catch (err: any) {
      console.warn(`Failed to fetch media from folder "${albumFolderName}" (${currentFolderId}):`, err.message)
      incomplete = true
      break
    }
  } while (pageToken)

  return {
    items: rawItems.map(f => mapDriveFile(f, albumFolderId, albumFolderName)),
    incomplete
  }
}

async function queryGoogleDriveFolder(
  apiKey: string,
  folderId: string,
  folderName: string,
  type?: 'photo' | 'video' | 'all',
  recursive = true
): Promise<{ items: DriveMediaItem[]; incomplete: boolean }> {
  const cacheKey = `drive-folder-${folderId}-${type || 'all'}-${recursive ? 'rec' : 'direct'}`
  const cached = getCached<DriveMediaItem[]>(cacheKey)
  if (cached) return { items: cached, incomplete: false }

  const mimeQuery = buildMimeQuery(type)

  if (!recursive) {
    const { items, incomplete } = await fetchDirectMediaInFolder(apiKey, folderId, folderId, folderName, mimeQuery)
    const uniqueItems = dedupeMediaItems(items)
    if (!incomplete) {
      setCache(cacheKey, uniqueItems)
    }
    return { items: uniqueItems, incomplete }
  }

  const visited = new Set<string>()

  const scanFolder = async (
    currentId: string,
    depth: number
  ): Promise<{ items: DriveMediaItem[]; incomplete: boolean }> => {
    if (visited.has(currentId)) {
      return { items: [], incomplete: false }
    }
    visited.add(currentId)

    const [directResult, subResult] = await Promise.all([
      fetchDirectMediaInFolder(apiKey, currentId, folderId, folderName, mimeQuery),
      depth < MAX_FOLDER_DEPTH
        ? fetchFoldersInParentResult(apiKey, currentId)
        : Promise.resolve({ folders: [] as DriveFolder[], incomplete: false })
    ])

    let nestedResults: Array<{ items: DriveMediaItem[]; incomplete: boolean }> = []
    if (subResult.folders.length > 0) {
      nestedResults = await mapConcurrent(subResult.folders, 4, sub => scanFolder(sub.id, depth + 1))
    }

    return {
      items: [...directResult.items, ...nestedResults.flatMap(r => r.items)],
      incomplete: directResult.incomplete || subResult.incomplete || nestedResults.some(r => r.incomplete)
    }
  }

  const { items, incomplete } = await scanFolder(folderId, 0)
  const uniqueItems = dedupeMediaItems(items)
  if (!incomplete) {
    setCache(cacheKey, uniqueItems)
  }
  return { items: uniqueItems, incomplete }
}

async function getAllDriveFiles(
  apiKey: string,
  rootFolderId: string
): Promise<{ items: DriveMediaItem[]; incomplete: boolean }> {
  const cacheKey = `drive-all-files-${rootFolderId}`
  const cached = getCached<DriveMediaItem[]>(cacheKey)
  if (cached) return { items: cached, incomplete: false }

  if (inFlightAllFiles) {
    return inFlightAllFiles
  }

  inFlightAllFiles = (async () => {
    try {
      const { folders, incomplete: foldersIncomplete } = await fetchGoogleDriveFoldersResult()
      const rootFilesPromise = queryGoogleDriveFolder(apiKey, rootFolderId, '', 'all', false)
      const folderFilesPromise = mapConcurrent(folders, 4, async (f) => {
        return await queryGoogleDriveFolder(apiKey, f.id, f.name, 'all', true)
      })

      const [rootResult, folderResults] = await Promise.all([
        rootFilesPromise,
        folderFilesPromise
      ])

      const uniqueFiles = dedupeMediaItems([
        ...rootResult.items,
        ...folderResults.flatMap(r => r.items)
      ])
      const incomplete = foldersIncomplete || rootResult.incomplete || folderResults.some(r => r.incomplete)

      if (!incomplete) {
        setCache(cacheKey, uniqueFiles)
      }
      return { items: uniqueFiles, incomplete }
    } catch (err: any) {
      console.warn('Failed to load all Drive files:', err.message)
      return { items: [], incomplete: true }
    } finally {
      inFlightAllFiles = null
    }
  })()

  return inFlightAllFiles
}

export async function fetchGoogleDriveFiles(options: MediaFilterOptions = {}): Promise<MediaResponse> {
  const { apiKey, folderId: rootFolderId } = getDriveConfig()

  if (apiKey && rootFolderId) {
    try {
      const requestedFolderId = options.folderId && options.folderId !== 'all' ? options.folderId : undefined
      let allFiles: DriveMediaItem[] = []

      if (requestedFolderId) {
        const cachedAll = getCached<DriveMediaItem[]>(`drive-all-files-${rootFolderId}`)
        if (cachedAll) {
          allFiles = cachedAll.filter(item => item.folderId === requestedFolderId)
        } else {
          const folders = await fetchGoogleDriveFolders()
          const targetFolder = folders.find(f => f.id === requestedFolderId)
          const folderName = targetFolder?.name || ''
          const { items } = await queryGoogleDriveFolder(apiKey, requestedFolderId, folderName, 'all', true)
          allFiles = items
        }
      } else {
        const { items } = await getAllDriveFiles(apiKey, rootFolderId)
        allFiles = items
      }

      return processAndPaginate(allFiles, options)
    } catch (err: any) {
      console.warn('Google Drive API fetch failed:', err.message)
    }
  }

  return processAndPaginate([], options)
}

function processAndPaginate(allFiles: DriveMediaItem[], options: MediaFilterOptions): MediaResponse {
  let list = [...allFiles]

  if (options.type === 'photo' || options.type === 'video') {
    list = list.filter(item => item.type === options.type)
  }

  if (options.search && options.search.trim()) {
    const term = options.search.toLowerCase().trim()
    list = list.filter(item =>
      item.title.toLowerCase().includes(term) ||
      item.name.toLowerCase().includes(term) ||
      (item.description && item.description.toLowerCase().includes(term))
    )
  }

  if (options.sort === 'oldest') {
    list.sort((a, b) => new Date(a.createdTime).getTime() - new Date(b.createdTime).getTime())
  } else if (options.sort === 'name-asc') {
    list.sort((a, b) => a.title.localeCompare(b.title))
  } else if (options.sort === 'name-desc') {
    list.sort((a, b) => b.title.localeCompare(a.title))
  } else {
    list.sort((a, b) => new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime())
  }

  const total = list.length
  const limit = options.limit || 16
  const pages = Math.max(1, Math.ceil(total / limit))
  const page = Math.min(pages, Math.max(1, options.page || 1))
  const offset = (page - 1) * limit
  const items = list.slice(offset, offset + limit)

  return {
    items,
    total,
    page,
    pages,
    limit
  }
}
