import { proxyMlRequest } from '@/lib/mlService'

export const dynamic = 'force-dynamic'

export async function GET() {
  return proxyMlRequest('/model-info')
}
