"use client"

/**
 * 共通ページレイアウトコンポーネント
 * 背景色とレイアウト構造を提供
 */
interface PageLayoutProps {
  children: React.ReactNode
  backgroundColorClass?: string
  className?: string
}

export function PageLayout({
  children,
  backgroundColorClass = "bg-gradient-to-br from-green-50 to-green-100",
  className = "",
}: PageLayoutProps) {
  return (
    <div className={`${backgroundColorClass} ${className}`}>
      {children}
    </div>
  )
}

