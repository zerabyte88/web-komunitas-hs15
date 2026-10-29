import { defineEventHandler, getRouterParam, getRequestHeader, createError } from 'h3'
import { getDriveConfig } from '../../../utils/drive'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid video ID' })
  }

  const { apiKey } = getDriveConfig()
  if (!apiKey) {
    throw createError({ statusCode: 500, statusMessage: 'Drive API key not configured' })
  }

  const reqHeaders: Record<string, string> = {}
  const range = getRequestHeader(event, 'range')
  if (range) {
    reqHeaders['Range'] = range
  }

  const url = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}?alt=media&key=${encodeURIComponent(apiKey)}`
  const upstream = await fetch(url, { headers: reqHeaders })

  if (!upstream.ok && upstream.status !== 206) {
    throw createError({ statusCode: upstream.status, statusMessage: 'Failed to stream video' })
  }

  const resHeaders = new Headers()
  for (const key of ['content-type', 'content-length', 'content-range', 'etag']) {
    const val = upstream.headers.get(key)
    if (val) resHeaders.set(key, val)
  }
  if (!resHeaders.has('content-type')) {
    resHeaders.set('content-type', 'video/mp4')
  }
  resHeaders.set('accept-ranges', 'bytes')
  resHeaders.set('cache-control', 'public, max-age=3600')

  return new Response(upstream.body, {
    status: upstream.status,
    headers: resHeaders
  })
})

