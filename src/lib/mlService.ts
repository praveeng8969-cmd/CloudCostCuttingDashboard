const DEFAULT_ML_SERVICE_URL = 'http://127.0.0.1:8000'

export function getMlServiceUrl(): string {
  return (process.env.ML_SERVICE_URL || DEFAULT_ML_SERVICE_URL).replace(/\/$/, '')
}

export async function proxyMlRequest(path: string, init?: RequestInit, timeoutMs = 15_000): Promise<Response> {
  try {
    const response = await fetch(`${getMlServiceUrl()}${path}`, {
      ...init,
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json', ...init?.headers },
      signal: AbortSignal.timeout(timeoutMs)
    })
    const body = await response.text()
    return new Response(body, {
      status: response.status,
      headers: { 'Content-Type': response.headers.get('content-type') || 'application/json' }
    })
  } catch {
    return Response.json(
      { detail: 'The CloudCut analysis service is unavailable. Check the backend service configuration.' },
      { status: 503 }
    )
  }
}
