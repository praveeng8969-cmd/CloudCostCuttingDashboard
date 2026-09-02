import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { AppProviders } from '@/components/providers/AppProviders'

export const metadata: Metadata = {
  title: 'CloudCut — Cloud Storage Cost Cutting Dashboard',
  description: 'Monitor cloud storage usage, identify unnecessary storage, analyze costs, and discover opportunities to reduce cloud storage expenses.',
  keywords: 'cloud storage, cost optimization, cloud cost, AWS S3, Google Cloud Storage, Azure, dashboard',
  icons: {
    icon: '/images/cloudcut-icon.png',
    shortcut: '/images/cloudcut-icon.png',
    apple: '/images/cloudcut-icon.png',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          {children}
        </AppProviders>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#0f172a',
              color: '#f8fafc',
              border: '1px solid #334155',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 600,
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
      </body>
    </html>
  )
}
