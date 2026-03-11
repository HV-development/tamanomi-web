"use client"

interface BackToTopButtonProps {
  visible: boolean
  onClick: () => void
}

/**
 * 一覧先頭へ戻るフロートボタン。
 */
export function BackToTopButton({ visible, onClick }: BackToTopButtonProps) {
  if (!visible) return null
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-20 right-4 z-40 px-4 py-3 rounded-full shadow-lg bg-green-600 text-white text-sm hover:bg-green-700 transition-colors"
      aria-label="先頭へ戻る"
    >
      先頭へ戻る
    </button>
  )
}
