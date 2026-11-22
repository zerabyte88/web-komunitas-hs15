import { defineEventHandler, getQuery, setHeader } from 'h3'
import { clearDriveCache, fetchGoogleDriveFiles } from '../../utils/drive'
import type { MediaType } from '../../../types/drive'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  if (query.refresh === '1') {
    clearDriveCache()
    setHeader(event, 'Cache-Control', 'no-store')
  } else {
    setHeader(event, 'Cache-Control', 'public, max-age=60, s-maxage=120, stale-while-revalidate=300')
  }

  const type = query.type as MediaType | undefined
  const folderId = query.folderId ? String(query.folderId) : undefined
  const search = query.search ? String(query.search) : undefined
  const sort = query.sort ? String(query.sort) as any : undefined
  const page = query.page ? Number(query.page) : 1
  const limit = query.limit ? Number(query.limit) : 16

  return await fetchGoogleDriveFiles({
    type,
    folderId,
    search,
    sort,
    page,
    limit
  })
})
