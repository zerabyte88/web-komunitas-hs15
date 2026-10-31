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
  cache.clear()
  inFlightAllFiles = null
}

export function getDriveConfig(): DriveConfig {
  let runtimeConfigApiKey = ''
  let runtimeConfigFolderId = ''

  try {
    const config = useRuntimeConfig()
    runtimeConfigApiKey = (config?.googleDriveApiKey as string) || ''
    runtimeConfigFolderId = (config?.googleDriveFolderId as string) || ''
  } catch {
    // Fallback if accessed outside Nitro request context
  }

  return {
    apiKey: customConfig.apiKey || runtimeConfigApiKey || process.env.GOOGLE_DRIVE_API_KEY || '',
    folderId: customConfig.folderId || runtimeConfigFolderId || process.env.GOOGLE_DRIVE_FOLDER_ID || ''
  }
}

// In-memory cache to stay fast and avoid exceeding Google API quota
interface CacheEntry<T> {
  data: T
  expiry: number
}

const cache = new Map<string, CacheEntry<any>>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

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

// Single-flight in-memory promise to prevent duplicate concurrent network fetch storms
let inFlightAllFiles: Promise<DriveMediaItem[]> | null = null

// Fetch with automatic retry and exponential backoff for rate limits (429/403/5xx)
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

// Controlled concurrency executor to prevent burst quota violations
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

export async function fetchFoldersInParent(apiKey: string, parentId: string): Promise<DriveFolder[]> {
  const folders: DriveFolder[] = []
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
      break
    }
  } while (pageToken)

  return folders
}

export async function fetchGoogleDriveFolders(): Promise<DriveFolder[]> {
  const { apiKey, folderId } = getDriveConfig()

  if (apiKey && folderId) {
    try {
      const cacheKey = `drive-folders-${folderId}`
      const cached = getCached<DriveFolder[]>(cacheKey)
      if (cached) return cached

      const folders = await fetchFoldersInParent(apiKey, folderId)
      setCache(cacheKey, folders)
      return folders
    } catch (err: any) {
      console.warn('Google Drive folders fetch failed:', err.message)
    }
  }

  return []
}

export async function fetchGoogleDriveStats(): Promise<DriveStats> {
  const { apiKey, folderId: rootFolderId } = getDriveConfig()
  const folders = await fetchGoogleDriveFolders()

  if (apiKey && rootFolderId) {
    const allFiles = await getAllDriveFiles(apiKey, rootFolderId)
    const photos = allFiles.filter(item => item.type === 'photo').length
    const videos = allFiles.filter(item => item.type === 'video').length

    return {
      photos,
      videos,
      folders: folders.length
    }
  }

  return {
    photos: 0,
    videos: 0,
    folders: folders.length
  }
}

async function queryGoogleDriveFolder(
  apiKey: string,
  folderId: string,
  folderName: string,
  type?: 'photo' | 'video' | 'all'
): Promise<DriveMediaItem[]> {
  try {
    const cacheKey = `drive-folder-${folderId}-${type || 'all'}`
    const cached = getCached<DriveMediaItem[]>(cacheKey)
    if (cached) return cached

    let mimeQuery = "(mimeType contains 'image/' or mimeType contains 'video/' or fileExtension = 'mp4' or fileExtension = 'mov' or fileExtension = 'webm' or fileExtension = 'mkv' or fileExtension = 'avi' or fileExtension = '3gp' or fileExtension = 'jpg' or fileExtension = 'jpeg' or fileExtension = 'png' or fileExtension = 'webp')"
    if (type === 'photo') {
      mimeQuery = "(mimeType contains 'image/' or fileExtension = 'jpg' or fileExtension = 'jpeg' or fileExtension = 'png' or fileExtension = 'webp')"
    } else if (type === 'video') {
      mimeQuery = "(mimeType contains 'video/' or fileExtension = 'mp4' or fileExtension = 'mov' or fileExtension = 'webm' or fileExtension = 'mkv' or fileExtension = 'avi' or fileExtension = '3gp')"
    }

    const items: any[] = []
    let pageToken: string | undefined = undefined

    do {
      const q = encodeURIComponent(`'${folderId}' in parents and trashed = false and ${mimeQuery}`)
      const fields = encodeURIComponent('nextPageToken,files(id,name,mimeType,fileExtension,description,createdTime,size,imageMediaMetadata,videoMediaMetadata,thumbnailLink,webContentLink,webViewLink)')
      let url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=${fields}&key=${apiKey}&pageSize=1000&orderBy=createdTime desc&supportsAllDrives=true&includeItemsFromAllDrives=true`
      if (pageToken) {
        url += `&pageToken=${encodeURIComponent(pageToken)}`
      }

      const res = await fetchWithRetry<{ nextPageToken?: string; files?: any[] }>(url)
      if (res?.files?.length) {
        items.push(...res.files)
      }
      pageToken = res?.nextPageToken
    } while (pageToken)

    const mapped: DriveMediaItem[] = items.map((f: any) => {
      const ext = (f.fileExtension || f.name?.split('.').pop() || '').toLowerCase()
      const isVideo = f.mimeType?.includes('video') || ['mp4', 'mov', 'webm', 'mkv', 'avi', '3gp'].includes(ext)
      const mediaType: 'photo' | 'video' = isVideo ? 'video' : 'photo'

      // Responsive grid thumbnail
      let thumb = f.thumbnailLink || ''
      if (thumb && thumb.includes('=s')) {
        thumb = thumb.replace(/=s\d+/, '=s400')
      } else if (thumb) {
        thumb = `${thumb}=s400`
      } else {
        thumb = `https://lh3.googleusercontent.com/d/${f.id}=s400`
      }

      // High quality preview
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
        folderId,
        folderName: folderName || '',
        size: f.size ? Number(f.size) : undefined,
        width: Number(f.imageMediaMetadata?.width || f.videoMediaMetadata?.width) || undefined,
        height: Number(f.imageMediaMetadata?.height || f.videoMediaMetadata?.height) || undefined,
        durationMillis: f.videoMediaMetadata?.durationMillis ? Number(f.videoMediaMetadata.durationMillis) : undefined
      }
    })

    setCache(cacheKey, mapped)
    return mapped
  } catch (err: any) {
    console.warn(`Failed to fetch media from folder "${folderName}" (${folderId}):`, err.message)
    return []
  }
}

async function queryFolderHierarchy(
  apiKey: string,
  folderId: string,
  folderName: string,
  type?: 'photo' | 'video' | 'all'
): Promise<DriveMediaItem[]> {
  const currentItems = await queryGoogleDriveFolder(apiKey, folderId, folderName, type)

  // Recursively inspect child folders if any exist within this album/folder
  try {
    const subfolders = await fetchFoldersInParent(apiKey, folderId)
    if (subfolders.length > 0) {
      const subResults = await mapConcurrent(subfolders, 3, async (sub) => {
        return await queryFolderHierarchy(apiKey, sub.id, folderName || sub.name, type)
      })
      return [...currentItems, ...subResults.flat()]
    }
  } catch (err: any) {
    console.warn(`Subfolder traversal failed for ${folderName} (${folderId}):`, err.message)
  }

  return currentItems
}

async function getAllDriveFiles(apiKey: string, rootFolderId: string): Promise<DriveMediaItem[]> {
  const cacheKey = `drive-all-files-${rootFolderId}`
  const cached = getCached<DriveMediaItem[]>(cacheKey)
  if (cached) return cached

  if (inFlightAllFiles) {
    return inFlightAllFiles
  }

  inFlightAllFiles = (async () => {
    try {
      const folders = await fetchGoogleDriveFolders()

      // Target folders: root folder itself + all top-level album folders
      const targetFolders = [
        { id: rootFolderId, name: '' },
        ...folders.map(f => ({ id: f.id, name: f.name }))
      ]

      // Fetch folder hierarchies with controlled concurrency
      const results = await mapConcurrent(targetFolders, 3, async (f) => {
        return await queryFolderHierarchy(apiKey, f.id, f.name, 'all')
      })

      const allFiles = results.flat()

      // Deduplicate files by id
      const uniqueMap = new Map<string, DriveMediaItem>()
      for (const item of allFiles) {
        if (!uniqueMap.has(item.id)) {
          uniqueMap.set(item.id, item)
        }
      }
      const uniqueFiles = Array.from(uniqueMap.values())

      setCache(cacheKey, uniqueFiles)
      return uniqueFiles
    } catch (err: any) {
      console.warn('Failed to load all Drive files:', err.message)
      return []
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
          const folders = await fetchGoogleDriveFolders()
          const targetFolder = folders.find(f => f.id === requestedFolderId)
          const targetName = targetFolder?.name || ''
          allFiles = cachedAll.filter(item => item.folderId === requestedFolderId || item.folderName === targetName)
        } else {
          const folders = await fetchGoogleDriveFolders()
          const targetFolder = folders.find(f => f.id === requestedFolderId)
          const folderName = targetFolder?.name || ''
          allFiles = await queryFolderHierarchy(apiKey, requestedFolderId, folderName, 'all')
        }
      } else {
        allFiles = await getAllDriveFiles(apiKey, rootFolderId)
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

  // Filter by media type (photo | video)
  if (options.type === 'photo' || options.type === 'video') {
    list = list.filter(item => item.type === options.type)
  }

  // Search filter
  if (options.search && options.search.trim()) {
    const term = options.search.toLowerCase().trim()
    list = list.filter(item => 
      item.title.toLowerCase().includes(term) ||
      item.name.toLowerCase().includes(term) ||
      (item.description && item.description.toLowerCase().includes(term))
    )
  }

  // Sort
  if (options.sort === 'oldest') {
    list.sort((a, b) => new Date(a.createdTime).getTime() - new Date(b.createdTime).getTime())
  } else if (options.sort === 'name-asc') {
    list.sort((a, b) => a.title.localeCompare(b.title))
  } else if (options.sort === 'name-desc') {
    list.sort((a, b) => b.title.localeCompare(a.title))
  } else {
    // default: newest
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
