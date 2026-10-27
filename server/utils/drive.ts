import type { DriveMediaItem, DriveFolder, DriveStats, MediaFilterOptions, MediaResponse } from '../../types/drive'

// Global Nitro auto-imports declarations for seamless IDE intellisense
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

export async function fetchGoogleDriveFiles(options: MediaFilterOptions = {}): Promise<MediaResponse> {
  const { apiKey, folderId: rootFolderId } = getDriveConfig()

  // Use live Google Drive API if apiKey and folderId are configured
  if (apiKey && rootFolderId) {
    try {
      const type = options.type || 'all'
      const requestedFolderId = options.folderId && options.folderId !== 'all' ? options.folderId : undefined

      let allFiles: DriveMediaItem[] = []

      if (requestedFolderId) {
        // Specific folder/album selected
        const folders = await fetchGoogleDriveFolders()
        const targetFolder = folders.find(f => f.id === requestedFolderId)
        const folderName = targetFolder?.name || ''
        allFiles = await queryGoogleDriveFolder(apiKey, requestedFolderId, folderName, options.type)
      } else {
        // "Semua Album": fetch from all album subfolders + root folder
        const cacheKey = `drive-all-files-${rootFolderId}-${type}`
        const cached = getCached<DriveMediaItem[]>(cacheKey)

        if (cached) {
          allFiles = cached
        } else {
          const folders = await fetchGoogleDriveFolders()

          // Query all album subfolders in parallel
          const folderPromises = folders.map(f =>
            queryGoogleDriveFolder(apiKey, f.id, f.name, options.type)
          )

          // Also check root folder in case any media files are directly at root
          folderPromises.push(queryGoogleDriveFolder(apiKey, rootFolderId, '', options.type))

          const results = await Promise.all(folderPromises)
          allFiles = results.flat()

          setCache(cacheKey, allFiles)
        }
      }

      return processAndPaginate(allFiles, options)
    } catch (err: any) {
      console.warn('Google Drive API fetch failed:', err.message)
    }
  }

  // Return empty list if Google Drive API is not configured or fails
  return processAndPaginate([], options)
}

export async function fetchGoogleDriveFolders(): Promise<DriveFolder[]> {
  const { apiKey, folderId } = getDriveConfig()

  if (apiKey && folderId) {
    try {
      const cacheKey = `drive-folders-${folderId}`
      const cached = getCached<DriveFolder[]>(cacheKey)
      if (cached) return cached

      const q = encodeURIComponent(`'${folderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`)
      const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)&key=${apiKey}&orderBy=name&pageSize=100`

      const res = await $fetch<{ files?: Array<{ id: string; name: string }> }>(url)
      const folders: DriveFolder[] = (res.files || []).map(f => ({
        id: f.id,
        name: f.name
      }))

      setCache(cacheKey, folders)
      return folders
    } catch (err: any) {
      console.warn('Google Drive folders fetch failed:', err.message)
    }
  }

  return []
}

export async function fetchGoogleDriveStats(): Promise<DriveStats> {
  const folders = await fetchGoogleDriveFolders()
  const [photoRes, videoRes] = await Promise.all([
    fetchGoogleDriveFiles({ type: 'photo', limit: 1 }),
    fetchGoogleDriveFiles({ type: 'video', limit: 1 })
  ])

  return {
    photos: photoRes.total,
    videos: videoRes.total,
    folders: folders.length
  }
}

async function queryGoogleDriveFolder(
  apiKey: string,
  folderId: string,
  folderName: string,
  type?: 'photo' | 'video'
): Promise<DriveMediaItem[]> {
  try {
    const cacheKey = `drive-folder-${folderId}-${type || 'all'}`
    const cached = getCached<DriveMediaItem[]>(cacheKey)
    if (cached) return cached

    let mimeQuery = "(mimeType contains 'image/' or mimeType contains 'video/')"
    if (type === 'photo') {
      mimeQuery = "mimeType contains 'image/'"
    } else if (type === 'video') {
      mimeQuery = "mimeType contains 'video/'"
    }

    const items: any[] = []
    let pageToken: string | undefined = undefined

    do {
      const q = encodeURIComponent(`'${folderId}' in parents and trashed = false and ${mimeQuery}`)
      const fields = encodeURIComponent('nextPageToken,files(id,name,mimeType,description,createdTime,size,imageMediaMetadata,videoMediaMetadata,thumbnailLink,webContentLink,webViewLink)')
      let url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=${fields}&key=${apiKey}&pageSize=100&orderBy=createdTime desc`
      if (pageToken) {
        url += `&pageToken=${encodeURIComponent(pageToken)}`
      }

      const res = await $fetch<{ nextPageToken?: string; files?: any[] }>(url)
      if (res.files?.length) {
        items.push(...res.files)
      }
      pageToken = res.nextPageToken
    } while (pageToken)

    const mapped: DriveMediaItem[] = items.map((f: any) => {
      const isVideo = f.mimeType?.includes('video')
      const mediaType: 'photo' | 'video' = isVideo ? 'video' : 'photo'

      // High-res Google thumbnail replacement
      let thumb = f.thumbnailLink || ''
      if (thumb && thumb.includes('=s')) {
        thumb = thumb.replace(/=s\d+/, '=s800')
      } else if (thumb) {
        thumb = `${thumb}=s800`
      } else {
        thumb = `https://lh3.googleusercontent.com/d/${f.id}=s800`
      }

      // High quality preview
      const preview = isVideo 
        ? `https://drive.google.com/file/d/${f.id}/preview`
        : `https://lh3.googleusercontent.com/d/${f.id}=s0`

      const download = f.webContentLink || `https://drive.google.com/uc?export=download&id=${f.id}`

      return {
        id: f.id,
        name: f.name,
        title: f.description?.split('\n')[0] || f.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        description: f.description || '',
        mimeType: f.mimeType,
        type: mediaType,
        thumbnailUrl: thumb,
        previewUrl: preview,
        downloadUrl: download,
        createdTime: f.createdTime || new Date().toISOString(),
        folderId,
        folderName: folderName || '',
        size: f.size ? Number(f.size) : undefined,
        width: f.imageMediaMetadata?.width || f.videoMediaMetadata?.width,
        height: f.imageMediaMetadata?.height || f.videoMediaMetadata?.height,
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

function processAndPaginate(allFiles: DriveMediaItem[], options: MediaFilterOptions): MediaResponse {
  let list = [...allFiles]

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
