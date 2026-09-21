import type { Metadata } from 'next'
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { getCurrentFormat } from '@/lib/format'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono' })

export const metadata: Metadata = {
  title: 'PokeChat - Pokemon VGC Team Analysis & Meta Insights',
  description: 'Professional Pokemon VGC team analysis platform with AI-powered insights, meta trends, and strategic planning tools for competitive players.',
  generator: 'PokeChat',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const format = await getCurrentFormat()

  return (
    <html lang="en" className={`dark ${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
      </head>
      <body className="font-body-md text-body-md">
        <SiteHeader format={format} />
        <main className="w-full pt-16 bg-surface-deep min-h-[calc(100vh-120px)]">{children}</main>
        <SiteFooter format={format} />
      </body>
    </html>
  )
}
