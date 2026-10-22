import { defineEventHandler, getQuery } from 'h3'
import { fetchGoogleDriveFiles } from '../../utils/drive'
import type { MediaType } from '../../../types/drive'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

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
