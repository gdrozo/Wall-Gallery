import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Wall Gallery',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html style={{ width: '100dvw', height: '100dvh', overflow: 'hidden' }} lang='en'>
      <body style={{ width: '100dvw', height: '100dvh' }}>{children}</body>
    </html>
  )
}
