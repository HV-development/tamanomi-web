"use client"

import { CheckCircle, AlertTriangle, Info } from 'lucide-react'
import { HeaderLogo } from '@/components/atoms/HeaderLogo'

interface UsageGuidePageProps {
  onBack: () => void
  onLogoClick: () => void
}

export function UsageGuidePage({ onBack, onLogoClick }: UsageGuidePageProps) {
  const backgroundColorClass = "bg-gradient-to-br from-green-50 to-green-100"

  const usageSteps = [
    {
      step: 1,
      title: "店員さんに画面を見せる",
      description: "クーポン確認画面を店員さんにお見せください。",
      details: [
        "画面を店員さんに向けてください",
        "クーポンの内容を確認してもらいます",
        "店員さんが内容を確認するまでお待ちください"
      ]
    },
    {
      step: 2,
      title: "利用者ご自身で「利用する」ボタンをタップしてください",
      description: "クーポンを使用します。利用できるのは1店舗1回のみです。",
      details: [
        "お客様ご自身では押さないでください",
        "店員にクーポン内容を確認してもらった後にタップしてください",
        "ボタンをタップするとクーポンが使用済みになります"
      ]
    },
    {
      step: 3,
      title: "クーポン適用完了",
      description: "クーポンが正常に適用され、ドリンクが一杯無料になります​。",
      details: [
        "使用完了画面が表示されます",
        "利用履歴に記録されます"
      ]
    }
  ]

  const importantNotes = [
    "毎日1店につき1回まで利用可能です",
    "クーポンは翌日の0:00にリセットされます",
    "20歳未満の方はアルコールは飲めません",
    "一度使用したクーポンはキャンセルできません",
    "有効期限をご確認ください"
  ]

  return (
    <div className={`min-h-screen ${backgroundColorClass}`}>
      <HeaderLogo onLogoClick={onLogoClick} showBackButton={true} onBackClick={onBack} />

      {/* メインコンテンツ */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">クーポン使用方法</h1>
              <p className="text-gray-600">正しい使用手順をご確認ください</p>
            </div>

            {/* 使用手順 */}
            <div className="space-y-6 mb-8">
              {usageSteps.map((step, index) => (
                <div
                  key={step.step}
                  className="bg-gray-50 rounded-2xl border border-gray-200 p-6 animate-in slide-in-from-left-4 duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-bold text-lg">{step.step}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h5 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h5>
                      <p className="text-gray-700 mb-3 leading-relaxed">{step.description}</p>
                      <ul className="space-y-1">
                        {step.details.map((detail, detailIndex) => (
                          <li key={detailIndex} className="flex items-start gap-2 text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 重要な注意事項 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-8">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                <h3 className="text-lg font-bold text-yellow-900">重要な注意事項</h3>
              </div>
              <ul className="space-y-2">
                {importantNotes.map((note, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-yellow-800">
                    <span className="text-yellow-600 font-bold flex-shrink-0 mt-0.5">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* サポート情報 */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <div className="flex items-start gap-3 mb-4">
                <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <h3 className="text-lg font-bold text-blue-900">困ったときは</h3>
              </div>
              <p className="text-sm text-blue-800 leading-relaxed">
                クーポンの使用でご不明な点やトラブルがございましたら、
                メニューの「お問い合わせ」からお気軽にご連絡ください。
                サポートチームが迅速に対応いたします。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}