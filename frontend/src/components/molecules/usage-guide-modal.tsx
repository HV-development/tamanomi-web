import { X, Ticket, CheckCircle, AlertTriangle, Info } from 'lucide-react'

interface UsageGuideModalProps {
  isOpen: boolean
  onClose: () => void
}

export function UsageGuideModal({ isOpen, onClose }: UsageGuideModalProps) {
  if (!isOpen) return null

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

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <>
      {/* オーバーレイ */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10001] animate-in fade-in-0 duration-300"
        onClick={handleOverlayClick}
      ></div>

      {/* モーダル */}
      <div className="fixed inset-x-4 top-4 bottom-4 bg-white rounded-3xl shadow-2xl z-[10001] max-w-lg mx-auto overflow-hidden border-2 border-green-200 animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex flex-col h-full">
          {/* ヘッダー */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-full">
                  <Ticket className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">クーポン使用方法</h3>
                  <p className="text-green-100 text-sm">正しい使用手順をご確認ください</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110 hover:rotate-90"
                aria-label="閉じる"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* コンテンツ */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            <div className="space-y-6">
              {/* 使用手順 */}
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

              {/* 重要な注意事項 */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
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
              </div>
            </div>
          </div>

          <div className="bg-green-600 p-4 text-white flex-shrink-0 rounded-t-3xl">
            <div className="flex items-center justify-between">
              <div className="w-8"></div>
              <div className="text-center">
                <h3 className="text-xl font-bold">クーポン使用方法</h3>
              </div>
              <div className="w-8"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}