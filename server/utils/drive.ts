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

// High quality initial/fallback dataset for HS15 Komunitas Keliling Banjar
const fallbackFolders: DriveFolder[] = [
  { id: 'folder-touring-banjar', name: 'Touring Banjar 2026', count: 3 },
  { id: 'folder-lembah-pajamben', name: 'Wisata Lembah Pajamben', count: 2 },
  { id: 'folder-kumpul-santai', name: 'Kumpul Santai HS15', count: 2 },
  { id: 'folder-video-perjalanan', name: 'Video Dokumentasi', count: 2 }
]

const fallbackMedia: DriveMediaItem[] = [
  {
    id: 'hs15-photo-1',
    name: 'perjalanan-banjar-1.jpg',
    title: 'Keindahan Jalur Banjar Selatan',
    description: 'Dokumentasi touring kebersamaan keliling sudut kota Banjar di pagi hari yang cerah.',
    mimeType: 'image/webp',
    type: 'photo',
    thumbnailUrl: '/img/background-1.webp',
    previewUrl: '/img/background-1.webp',
    downloadUrl: '/img/background-1.webp',
    createdTime: '2026-09-21T08:30:00Z',
    folderId: 'folder-touring-banjar',
    folderName: 'Touring Banjar 2026',
    width: 1920,
    height: 1080
  },
  {
    id: 'hs15-photo-2',
    name: 'perjalanan-banjar-2.jpg',
    title: 'Panorama Lembah Hijau',
    description: 'Pemandangan asri dan sejuk di kawasan perbukitan Banjar bersama komunitas.',
    mimeType: 'image/webp',
    type: 'photo',
    thumbnailUrl: '/img/background-2.webp',
    previewUrl: '/img/background-2.webp',
    downloadUrl: '/img/background-2.webp',
    createdTime: '2026-09-22T09:15:00Z',
    folderId: 'folder-lembah-pajamben',
    folderName: 'Wisata Lembah Pajamben',
    width: 1920,
    height: 1080
  },
  {
    id: 'hs15-photo-3',
    name: 'perjalanan-banjar-3.jpg',
    title: 'Titik Temu Rest Area',
    description: 'Momen rehat dan ramah tamah anggota komunitas setelah perjalanan panjang.',
    mimeType: 'image/webp',
    type: 'photo',
    thumbnailUrl: '/img/background-3.webp',
    previewUrl: '/img/background-3.webp',
    downloadUrl: '/img/background-3.webp',
    createdTime: '2026-09-23T14:40:00Z',
    folderId: 'folder-kumpul-santai',
    folderName: 'Kumpul Santai HS15',
    width: 1920,
    height: 1080
  },
  {
    id: 'hs15-photo-4',
    name: 'perjalanan-banjar-4.jpg',
    title: 'Lintasan Senja Banjar',
    description: 'Menyusuri jalanan pedesaan yang tenang menjelang matahari terbenam.',
    mimeType: 'image/webp',
    type: 'photo',
    thumbnailUrl: '/img/background-4.webp',
    previewUrl: '/img/background-4.webp',
    downloadUrl: '/img/background-4.webp',
    createdTime: '2026-09-24T17:20:00Z',
    folderId: 'folder-touring-banjar',
    folderName: 'Touring Banjar 2026',
    width: 1920,
    height: 1080
  },
  {
    id: 'hs15-photo-5',
    name: 'perjalanan-banjar-5.jpg',
    title: 'Jejak Kebersamaan HS15',
    description: 'Formasi konvoi dan semangat kekeluargaan Komunitas Keliling Banjar.',
    mimeType: 'image/webp',
    type: 'photo',
    thumbnailUrl: '/img/background-5.webp',
    previewUrl: '/img/background-5.webp',
    downloadUrl: '/img/background-5.webp',
    createdTime: '2026-09-25T11:00:00Z',
    folderId: 'folder-kumpul-santai',
    folderName: 'Kumpul Santai HS15',
    width: 1920,
    height: 1080
  },
  {
    id: 'hs15-video-1',
    name: 'sorotan-touring-banjar.mp4',
    title: 'Video Highlight Touring HS15',
    description: 'Rekaman sinematik perjalanan konvoi komunitas keliling Banjar melintasi rute perbukitan.',
    mimeType: 'video/mp4',
    type: 'video',
    thumbnailUrl: '/img/background-1.webp',
    previewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    downloadUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    createdTime: '2026-09-25T16:00:00Z',
    folderId: 'folder-video-perjalanan',
    folderName: 'Video Dokumentasi',
    durationMillis: 180000
  },
  {
    id: 'hs15-video-2',
    name: 'rekap-kegiatan-hs15.mp4',
    title: 'Rekap Suasana & Keseruan Komunitas',
    description: 'Kompilasi tawa, cerita, dan kebersamaan di titik kumpul akhir kegiatan.',
    mimeType: 'video/mp4',
    type: 'video',
    thumbnailUrl: '/img/background-3.webp',
    previewUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    downloadUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    createdTime: '2026-09-26T19:30:00Z',
    folderId: 'folder-video-perjalanan',
    folderName: 'Video Dokumentasi',
    durationMillis: 245000
  }
]

export async function fetchGoogleDriveFiles(options: MediaFilterOptions = {}): Promise<MediaResponse> {
  const { apiKey, folderId } = getDriveConfig()

  // Use live Google Drive API if apiKey is configured
  if (apiKey && folderId) {
    try {
      const cacheKey = `drive-files-${folderId}-${options.type || 'all'}-${options.folderId || ''}`
      let allFiles = getCached<DriveMediaItem[]>(cacheKey)

      if (!allFiles) {
        allFiles = await queryGoogleDrive(apiKey, options.folderId || folderId, options.type)
        setCache(cacheKey, allFiles)
      }

      return processAndPaginate(allFiles, options)
    } catch (err: any) {
      console.warn('Google Drive API fetch failed, falling back to local archive data:', err.message)
    }
  }

  // Fallback to local community archive data
  let files = [...fallbackMedia]
  if (options.type) {
    files = files.filter(f => f.type === options.type)
  }
  if (options.folderId && options.folderId !== 'all') {
    files = files.filter(f => f.folderId === options.folderId)
  }
  return processAndPaginate(files, options)
}

export async function fetchGoogleDriveFolders(): Promise<DriveFolder[]> {
  const { apiKey, folderId } = getDriveConfig()

  if (apiKey && folderId) {
    try {
      const cacheKey = `drive-folders-${folderId}`
      const cached = getCached<DriveFolder[]>(cacheKey)
      if (cached) return cached

      const q = encodeURIComponent(`'${folderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`)
      const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)&key=${apiKey}&orderBy=name`

      const res = await $fetch<{ files?: Array<{ id: string; name: string }> }>(url)
      const folders: DriveFolder[] = (res.files || []).map(f => ({
        id: f.id,
        name: f.name
      }))

      setCache(cacheKey, folders)
      return folders
    } catch (err: any) {
      console.warn('Google Drive folders fetch failed, using fallback folders:', err.message)
    }
  }

  return fallbackFolders
}

export async function fetchGoogleDriveStats(): Promise<DriveStats> {
  const folders = await fetchGoogleDriveFolders()
  const photoRes = await fetchGoogleDriveFiles({ type: 'photo', limit: 1000 })
  const videoRes = await fetchGoogleDriveFiles({ type: 'video', limit: 1000 })

  return {
    photos: photoRes.total,
    videos: videoRes.total,
    folders: folders.length
  }
}

async function queryGoogleDrive(apiKey: string, parentFolderId: string, type?: 'photo' | 'video'): Promise<DriveMediaItem[]> {
  let mimeQuery = "(mimeType contains 'image/' or mimeType contains 'video/')"
  if (type === 'photo') {
    mimeQuery = "mimeType contains 'image/'"
  } else if (type === 'video') {
    mimeQuery = "mimeType contains 'video/'"
  }

  const q = encodeURIComponent(`'${parentFolderId}' in parents and trashed = false and ${mimeQuery}`)
  const fields = encodeURIComponent('files(id,name,mimeType,description,createdTime,size,imageMediaMetadata,videoMediaMetadata,thumbnailLink,webContentLink,webViewLink)')
  const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=${fields}&key=${apiKey}&pageSize=100&orderBy=createdTime desc`

  const res = await $fetch<{ files?: any[] }>(url)
  const items = res.files || []

  return items.map((f: any) => {
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
      folderId: parentFolderId,
      size: f.size ? Number(f.size) : undefined,
      width: f.imageMediaMetadata?.width || f.videoMediaMetadata?.width,
      height: f.imageMediaMetadata?.height || f.videoMediaMetadata?.height,
      durationMillis: f.videoMediaMetadata?.durationMillis ? Number(f.videoMediaMetadata.durationMillis) : undefined
    }
  })
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
