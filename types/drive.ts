export type MediaType = 'photo' | 'video'

export interface DriveMediaItem {
  id: string
  name: string
  title: string
  description?: string
  mimeType: string
  type: MediaType
  thumbnailUrl: string
  previewUrl: string
  downloadUrl: string
  createdTime: string
  folderId?: string
  folderName?: string
  size?: number
  width?: number
  height?: number
  durationMillis?: number
}

export interface DriveFolder {
  id: string
  name: string
  count?: number
}

export interface DriveStats {
  photos: number
  videos: number
  folders: number
}

export interface MediaFilterOptions {
  type?: MediaType | 'all'
  folderId?: string
  search?: string
  sort?: 'newest' | 'oldest' | 'name-asc' | 'name-desc'
  page?: number
  limit?: number
}

export interface MediaResponse {
  items: DriveMediaItem[]
  total: number
  page: number
  pages: number
  limit: number
}
