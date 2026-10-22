import { defineEventHandler } from 'h3'
import { fetchGoogleDriveFolders } from '../../utils/drive'

export default defineEventHandler(async () => {
  return await fetchGoogleDriveFolders()
})
