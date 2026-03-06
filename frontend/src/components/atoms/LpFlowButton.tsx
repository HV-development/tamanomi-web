'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

/**
 * LP用フローボタン
 * 画面左下に固定表示。スクロールしても常に左下に表示。
 * /lp → /register
 * /lp/merchant → /lp/merchant/apply
 */
export function LpFlowButton() {
  const pathname = usePathname()

  const href =
    pathname === '/lp/merchant' ? '/lp/merchant/apply' : '/register'

  return (
    <Link
      href={href}
      className="fixed right-4 bottom-6 z-[100] hover:opacity-90 transition-opacity"
      aria-label={pathname === '/lp/merchant' ? 'お申し込み' : '新規登録'}
    >
      <Image
        src="/lp/flow-button.svg"
        alt=""
        width={120}
        height={120}
        className="w-20 h-20 md:w-24 md:h-24"
        style={{ width: 'auto', height: 'auto', maxWidth: '120px', maxHeight: '120px' }}
      />
    </Link>
  )
}
