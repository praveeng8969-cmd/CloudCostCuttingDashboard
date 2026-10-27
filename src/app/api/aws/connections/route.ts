import { proxyMlRequest } from '@/lib/mlService'

export async function GET(request: Request) {
  const customerId = new URL(request.url).searchParams.get('customer_id')?.trim()
  if (!customerId) return Response.json({ detail: 'Customer ID is required.' }, { status: 400 })
  return proxyMlRequest(`/aws/connections/${encodeURIComponent(customerId)}`)
}

export async function POST(request: Request) {
  const body = await request.text()
  return proxyMlRequest('/aws/connections', { method: 'POST', body })
}
