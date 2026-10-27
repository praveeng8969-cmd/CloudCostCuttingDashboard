import { redirect } from 'next/navigation'

export default function LegacyInsightsRedirect() {
  redirect('/recommendations')
}
