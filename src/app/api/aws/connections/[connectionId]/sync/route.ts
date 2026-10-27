import { proxyMlRequest } from '@/lib/mlService'

export async function POST(request: Request, { params }: { params: Promise<{ connectionId: string }> }) {
  const { connectionId } = await params
  return proxyMlRequest(`/aws/connections/${encodeURIComponent(connectionId)}/sync`, { method: 'POST', body: await request.text() }, 300_000)
}
