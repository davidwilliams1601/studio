import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'LinkStream - Protect Your LinkedIn Data',
  description: 'Secure backup and AI insights for your professional network',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
