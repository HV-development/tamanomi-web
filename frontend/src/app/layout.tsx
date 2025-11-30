import type { Metadata } from 'next'
import { Limelight, Plaster } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { ErrorHandlerProvider } from '@/components/providers/ErrorHandlerProvider'

const limelight = Limelight({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-limelight',
})

const plaster = Plaster({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-plaster',
})

export const metadata: Metadata = {
  title: 'たまのみ - さいたま市のお得なサービス',
  description: 'さいたま市のお店で使える便利でお得なサービス「たまのみ」。会員登録でポイントが貯まる、クーポンが使えるなど、お得な特典がいっぱい！',
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/favicon.png',
    shortcut: '/favicon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body className={`${limelight.variable} ${plaster.variable}`}>
        <ErrorHandlerProvider>
          {children}
          <Toaster position="top-right" richColors />
        </ErrorHandlerProvider>
      </body>
    </html>
  )
}
