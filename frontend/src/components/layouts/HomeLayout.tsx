"use client"

import dynamic from "next/dynamic"

// 動的インポートでHomeLayoutを遅延読み込み
export const HomeLayout = dynamic(() => import("@/components/templates/home-layout").then(mod => ({ default: mod.HomeLayout })), {
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-green-600 font-medium">読み込み中...</p>
      </div>
    </div>
  ),
  ssr: false,
  suspense: true
})
