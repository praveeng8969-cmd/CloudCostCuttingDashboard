import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'CloudCut — Cloud Storage Cost Cutting Dashboard',
  description: 'Monitor cloud storage usage, identify unnecessary storage, analyze costs, and discover opportunities to reduce cloud storage expenses.',
  keywords: 'cloud storage, cost optimization, cloud cost, AWS S3, Google Cloud Storage, Azure, dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#fff',
              color: '#111827',
              border: '1px solid #e5e7eb',
              borderRadius: '10px',
              fontSize: '14px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
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
