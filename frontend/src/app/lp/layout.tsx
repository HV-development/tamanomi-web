import { Metadata } from 'next'
import './styles.css'
import { LpFlowButton } from '@/components/atoms/LpFlowButton'

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

export default function LPLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="lp-layout">
      <LpFlowButton />
      {children}
    </div>
  )
}