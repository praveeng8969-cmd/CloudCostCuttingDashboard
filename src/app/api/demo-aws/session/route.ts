import { cookies } from 'next/headers'
import { availableSampleCredentials, validateSampleAwsCredentials } from '@/lib/server/sampleAwsCredentials'

const COOKIE_NAME = 'cloudcut_demo_aws_session'

export async function GET() {
  return Response.json({ accounts: availableSampleCredentials() })
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { email?: unknown; password?: unknown } | null
  if (!body || typeof body.email !== 'string' || typeof body.password !== 'string') {
    return Response.json({ detail: 'Account email and password are required.' }, { status: 400 })
  }
  const account = validateSampleAwsCredentials(body.email, body.password)
  if (!account) return Response.json({ detail: 'Invalid sample account credentials.' }, { status: 401 })
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, account.id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 8,
    path: '/'
  })
  return Response.json({ account })
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
  return new Response(null, { status: 204 })
}
