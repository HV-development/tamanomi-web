import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'たまのみ - さいたま市のお得なサービス',
  description: 'さいたま市のお店で使える便利でお得なサービス「たまのみ」。会員登録でポイントが貯まる、クーポンが使えるなど、お得な特典がいっぱい！',
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: '/favicon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body>
        {children}
      </body>
    </html>
  )
}
