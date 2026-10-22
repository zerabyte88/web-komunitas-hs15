import { defineEventHandler, readBody } from 'h3'
import { setRuntimeDriveConfig, getDriveConfig, fetchGoogleDriveFiles } from '../../utils/drive'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ apiKey?: string; folderId?: string }>(event)

  if (body) {
    setRuntimeDriveConfig({
      apiKey: body.apiKey?.trim() || '',
      folderId: body.folderId?.trim() || ''
    })
  }

  const current = getDriveConfig()
  let isConnected = false
  let errorMsg: string | null = null

  if (current.apiKey && current.folderId) {
    try {
      // Test fetching 1 item from Google Drive
      const res = await fetchGoogleDriveFiles({ limit: 1 })
      isConnected = true
    } catch (err: any) {
      errorMsg = err.message || 'Gagal terhubung ke Google Drive API'
    }
  }

  return {
    success: true,
    apiKeyConfigured: Boolean(current.apiKey),
    folderIdConfigured: Boolean(current.folderId),
    folderId: current.folderId,
    isConnected,
    error: errorMsg
  }
})
