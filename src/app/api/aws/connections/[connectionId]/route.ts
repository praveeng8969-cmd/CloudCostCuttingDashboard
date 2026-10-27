import { proxyMlRequest } from '@/lib/mlService'

export async function DELETE(request: Request, { params }: { params: Promise<{ connectionId: string }> }) {
  const { connectionId } = await params
  const customerId = new URL(request.url).searchParams.get('customer_id')?.trim()
  if (!customerId) return Response.json({ detail: 'Customer ID is required.' }, { status: 400 })
  return proxyMlRequest(`/aws/connections/${encodeURIComponent(connectionId)}?customer_id=${encodeURIComponent(customerId)}`, { method: 'DELETE' })
}
