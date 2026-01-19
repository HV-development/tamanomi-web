import type { Metadata } from 'next'
import {
  Limelight,
  Plaster,
  Zen_Kaku_Gothic_New,
  Shippori_Antique,
  Rubik,
} from 'next/font/google'
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

const zenKakuGothicNew = Zen_Kaku_Gothic_New({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-zen-kaku-gothic-new',
})

const shipporiAntique = Shippori_Antique({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-shippori-antique',
})

const rubik = Rubik({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-rubik',
})

export const metadata: Metadata = {
  title: 'たまのみ - 毎日1杯無料で乾杯',
  description: 'さいたま市のお店で使える便利でお得なサービス「たまのみ」。対象の飲食店で毎日ドリンクが1杯無料になる"Welcomeドリンク"サービスです。',
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
      <body
        className={[
          limelight.variable,
          plaster.variable,
          zenKakuGothicNew.variable,
          shipporiAntique.variable,
          rubik.variable,
        ].join(' ')}
      >
        <ErrorHandlerProvider>
          {children}
          <Toaster position="top-right" richColors />
        </ErrorHandlerProvider>
      </body>
    </html>
  )
}

