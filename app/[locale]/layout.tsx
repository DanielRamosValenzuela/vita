import type { Metadata } from 'next'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import {
  Bitter,
  Cormorant_Garamond,
  Crimson_Pro,
  DM_Sans,
  Geist,
  Geist_Mono,
  IBM_Plex_Mono,
  Libre_Baskerville,
  Merriweather,
  Nunito,
  Outfit,
  Oxanium,
  Playfair_Display,
  Poppins,
  Quicksand,
  Source_Code_Pro,
  Space_Grotesk,
  Space_Mono,
} from 'next/font/google'
import { notFound } from 'next/navigation'

import { routing } from '@/i18n/routing'

import '../globals.css'
import '../themes.css'

import { AppProviders } from '@/src/shared/lib/providers'

import { siteMetadata } from './metadata'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const oxanium = Oxanium({
  variable: '--font-oxanium',
  subsets: ['latin'],
  display: 'swap',
})

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  display: 'swap',
})

const sourceCodePro = Source_Code_Pro({
  variable: '--font-source-code-pro',
  subsets: ['latin'],
  display: 'swap',
})

const spaceMono = Space_Mono({
  variable: '--font-space-mono',
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
})

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

const libreBaskerville = Libre_Baskerville({
  variable: '--font-libre-baskerville',
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
})

const ibmPlexMono = IBM_Plex_Mono({
  variable: '--font-ibm-plex-mono',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
})

const nunito = Nunito({
  variable: '--font-nunito',
  subsets: ['latin'],
  display: 'swap',
})

const merriweather = Merriweather({
  variable: '--font-merriweather',
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  display: 'swap',
})

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  display: 'swap',
})

const playfairDisplay = Playfair_Display({
  variable: '--font-playfair-display',
  subsets: ['latin'],
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  display: 'swap',
})

const crimsonPro = Crimson_Pro({
  variable: '--font-crimson-pro',
  subsets: ['latin'],
  display: 'swap',
})

const quicksand = Quicksand({
  variable: '--font-quicksand',
  subsets: ['latin'],
  display: 'swap',
})

const cormorantGaramond = Cormorant_Garamond({
  variable: '--font-cormorant-garamond',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

const bitter = Bitter({
  variable: '--font-bitter',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = siteMetadata

interface LocaleLayoutProps {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) notFound()

  const messages = await getMessages()

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`h-full ${geistSans.variable} ${geistMono.variable} ${oxanium.variable} ${outfit.variable} ${sourceCodePro.variable} ${spaceMono.variable} ${poppins.variable} ${libreBaskerville.variable} ${ibmPlexMono.variable} ${nunito.variable} ${merriweather.variable} ${dmSans.variable} ${playfairDisplay.variable} ${spaceGrotesk.variable} ${crimsonPro.variable} ${quicksand.variable} ${cormorantGaramond.variable} ${bitter.variable}`}
    >
      <body className="h-full antialiased font-sans" suppressHydrationWarning>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AppProviders>{children}</AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
