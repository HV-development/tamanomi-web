import { Metadata } from 'next'
import './styles.css'

export const metadata: Metadata = {
  title: 'たまのみ - 毎日1杯、無料で乾杯',
  description: '「たまのみ」は、毎日1軒につきドリンクが1杯無料になる新しい"Welcomeドリンク"サービスです。',
}

export default function LPLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="lp-layout">
      {children}
    </div>
  )
}