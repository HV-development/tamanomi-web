'use client'

import Image from "next/image"
import { ArrowLeft } from "lucide-react"

interface CampaignCodePageProps {
  onBack: () => void
}

export function CampaignCodePage({ onBack }: CampaignCodePageProps) {
  return (
    <div className="min-h-screen bg-green-50">
      <header className="bg-white shadow-sm">
        <div className="relative flex items-center justify-center max-w-md mx-auto px-4 py-4">
          <button
            type="button"
            onClick={onBack}
            className="absolute left-0 flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            戻る
          </button>
          <Image
            src="/logo.svg"
            alt="たまのみ"
            width={160}
            height={36}
            priority
            className="h-9 object-contain"
          />
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 py-12 space-y-8">
        <div className="bg-white border-2 border-green-300 rounded-3xl p-7 shadow-sm space-y-6">
          <p className="text-center text-green-800 font-bold text-xl">キャンペーンコード</p>
          <p className="text-center text-gray-700 text-base leading-relaxed">
            新規登録ページ内コード入力欄に
            <br />
            下記4桁の数字を入力してください
          </p>
          <p className="text-center text-green-700 font-extrabold text-6xl tracking-[0.35em]">5959</p>
        </div>

        <p className="text-center text-gray-600">
          <a
            href="/campaigncode.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-700 font-semibold underline hover:text-green-800"
          >
            詳細はこちら
          </a>
        </p>

        <div className="text-center space-y-1">
          <p className="text-red-600 font-semibold">有効期限：2026年3月31日(火)</p>
          <p className="text-red-600 font-semibold">お一人様一回限り有効</p>
        </div>

      </main>
    </div>
  )
}

