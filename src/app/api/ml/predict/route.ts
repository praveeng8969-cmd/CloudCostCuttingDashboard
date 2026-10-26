import { proxyMlRequest } from '@/lib/mlService'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ detail: 'Request body must be valid JSON.' }, { status: 400 })
  }

  if (!body || typeof body !== 'object' || !Array.isArray((body as { files?: unknown }).files)) {
    return Response.json({ detail: 'Request must contain a files array.' }, { status: 400 })
  }
  const files = (body as { files: unknown[] }).files
  if (files.length < 1 || files.length > 500) {
    return Response.json({ detail: 'Each prediction batch must contain between 1 and 500 files.' }, { status: 400 })
  }

  return proxyMlRequest('/predict', { method: 'POST', body: JSON.stringify({ files }) })
}
