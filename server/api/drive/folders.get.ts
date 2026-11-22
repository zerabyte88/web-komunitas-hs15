import { defineEventHandler, getQuery, setHeader } from 'h3'
import { clearDriveCache, fetchGoogleDriveFolders } from '../../utils/drive'

export default defineEventHandler(async (event) => {
  if (getQuery(event).refresh === '1') {
    clearDriveCache()
    setHeader(event, 'Cache-Control', 'no-store')
  } else {
    setHeader(event, 'Cache-Control', 'public, max-age=60, s-maxage=120, stale-while-revalidate=300')
  }
  return await fetchGoogleDriveFolders()
})
