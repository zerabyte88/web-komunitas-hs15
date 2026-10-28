import { ref, isRef, type Ref } from 'vue'
import type { MediaFilterOptions, MediaResponse, DriveFolder, DriveStats } from '../types/drive'

export function useGoogleDrive() {
  const getMedia = (options: Ref<MediaFilterOptions> | MediaFilterOptions) => {
    return useFetch<MediaResponse>('/api/drive/files', {
      query: options,
      watch: [isRef(options) ? options : ref(options)]
    })
  }

  const getFolders = () => {
    return useFetch<DriveFolder[]>('/api/drive/folders')
  }

  const getStats = () => {
    return useFetch<DriveStats>('/api/drive/stats')
  }

  return {
    getMedia,
    getFolders,
    getStats
  }
}
