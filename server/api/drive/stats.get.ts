import { defineEventHandler } from 'h3'
import { fetchGoogleDriveStats } from '../../utils/drive'

export default defineEventHandler(async () => {
  return await fetchGoogleDriveStats()
})
