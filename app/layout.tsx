import type { Metadata } from 'next'
import { CarolsProvider } from '@/context/CarolsContext'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'Christmas Carols Selection',
  description: 'Select and manage Christmas carols for your branch',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
      </head>
      <body>
        <CarolsProvider>{children}</CarolsProvider>
      </body>
    </html>
  )
}
