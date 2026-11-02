import { defineEventHandler, setHeader } from 'h3'
import { fetchGoogleDriveStats } from '../../utils/drive'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'public, max-age=300, s-maxage=900, stale-while-revalidate=86400')
  return await fetchGoogleDriveStats()
})
