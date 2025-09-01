'use client'

import { ArrowLeft, Ticket, CheckCircle, AlertTriangle, Info } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function UsageGuidePage() {
  const router = useRouter()

  const handleBack = () => {
    router.back()
  }

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
      title: "店員さんに確定ボタンを押してもらう",
      description: "店員さんに「確定する」ボタンを押してもらってください。",
      details: [
        "お客様ご自身では押さないでください",
        "店員さんが確認後に押していただきます",
        "ボタンを押すとクーポンが使用済みになります"
      ]
    },
    {
      step: 3,
      title: "クーポン適用完了",
      description: "クーポンが正常に適用され、割引が反映されます。",
      details: [
        "使用完了画面が表示されます",
        "レシートで割引内容をご確認ください",
        "利用履歴に記録されます"
      ]
    }
  ]

  const importantNotes = [
    "クーポンは1日1回まで利用可能です",
    "一度使用したクーポンはキャンセルできません",
    "他のクーポンとの併用はできません",
    "有効期限内にご利用ください",
    "店舗の営業時間内でのみ利用可能です"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 to-lime-100">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={handleBack} 
            className="flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            戻る
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 text-green-600">
              🍷
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-green-700 text-lg leading-tight">TAMAYOI</span>
              <span className="text-xs text-green-600 font-medium -mt-1">たまよい</span>
            </div>
          </div>
          <div className="w-12"></div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="p-6 max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Ticket className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">クーポン使用方法</h1>
          <p className="text-gray-600">正しい使用手順をご確認ください</p>
        </div>

        {/* 使用手順 */}
        <div className="space-y-6 mb-8">
          {usageSteps.map((step, index) => (
            <div 
              key={step.step}
              className="bg-white rounded-2xl border border-gray-200 p-6 animate-in slide-in-from-left-4 duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold text-lg">{step.step}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
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
  )
}