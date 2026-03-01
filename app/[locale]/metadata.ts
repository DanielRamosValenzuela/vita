import type { Metadata } from 'next'

export const siteMetadata: Metadata = {
  title: {
    default: 'VITA',
    template: '%s | VITA',
  },
  description: 'Workforce shift management platform',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  icons: {
    icon: [
      { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    siteName: 'VITA',
    title: 'VITA',
    description: 'Workforce shift management platform',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VITA',
    description: 'Workforce shift management platform',
    images: ['/og-image.png'],
  },
}
