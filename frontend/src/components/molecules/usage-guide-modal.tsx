"use client"

import { X, MapPin, Heart, Ticket, User, Search, Filter } from "lucide-react"

interface UsageGuideModalProps {
  isOpen: boolean
  onClose: () => void
}

export function UsageGuideModal({ isOpen, onClose }: UsageGuideModalProps) {
  if (!isOpen) return null

  const guideSteps = [
    {
      icon: Search,
      title: "お店を探す",
      description: "エリアやジャンルを選択して、お好みのお店を見つけましょう。",
      details: [
        "現在地ボタンで近くのお店を表示",
        "エリア選択でさいたま市内の区を指定",
        "ジャンル選択で料理の種類を絞り込み"
      ]
    },
    {
      icon: Ticket,
      title: "クーポンを使う",
      description: "気になるお店のクーポン一覧から、使いたいクーポンを選択します。",
      details: [
        "店舗カードの「クーポン一覧」ボタンをタップ",
        "利用したいクーポンを選択",
        "店員さんに画面を見せて確定ボタンを押してもらう"
      ]
    },
    {
      icon: Heart,
      title: "お気に入り登録",
      description: "気に入ったお店をお気に入りに登録して、後で簡単にアクセスできます。",
      details: [
        "店舗カードのハートマークをタップ",
        "お気に入りタブから登録したお店を確認",
        "いつでもお気に入りの解除が可能"
      ]
    },
    {
      icon: User,
      title: "マイページ",
      description: "利用履歴の確認やプロフィール編集ができます。",
      details: [
        "クーポンの利用履歴を確認",
        "決済履歴とプラン管理",
        "プロフィール情報の編集"
      ]
    }
  ]

  const handleOverlayClick = (e: React.MouseEvent) => {
    // オーバーレイをクリックした時のみ閉じる
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <>
      {/* オーバーレイ */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in-0 duration-300"
        onClick={handleOverlayClick}
      ></div>

      {/* モーダル */}
      <div className="fixed inset-x-4 top-4 bottom-4 bg-white rounded-3xl shadow-2xl z-50 max-w-lg mx-auto overflow-hidden border-2 border-green-200 animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex flex-col h-full">
          {/* ヘッダー */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-full">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">TAMAYOIの使い方</h3>
                  <p className="text-green-100 text-sm">アプリの基本的な使用方法</p>
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
              {/* アプリ概要 */}
              <div className="bg-white rounded-2xl border border-green-200 p-5">
                <h4 className="text-lg font-bold text-gray-900 mb-3">TAMAYOIとは？</h4>
                <p className="text-gray-700 leading-relaxed">
                  さいたま市内の飲食店で使えるお得なクーポンアプリです。
                  毎日1杯のお酒が無料になるクーポンを利用して、
                  さいたまの夜をもっと楽しくお過ごしください。
                </p>
              </div>

              {/* 使い方ステップ */}
              {guideSteps.map((step, index) => {
                const Icon = step.icon
                return (
                  <div 
                    key={index} 
                    className="bg-white rounded-2xl border border-gray-200 p-5 animate-in slide-in-from-left-4 duration-300"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <Icon className="w-6 h-6 text-green-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-green-600 text-white text-sm px-2 py-1 rounded-full font-bold">
                            {index + 1}
                          </span>
                          <h5 className="text-lg font-bold text-gray-900">{step.title}</h5>
                        </div>
                        <p className="text-gray-700 mb-3 leading-relaxed">{step.description}</p>
                        <ul className="space-y-1">
                          {step.details.map((detail, detailIndex) => (
                            <li key={detailIndex} className="flex items-start gap-2 text-sm text-gray-600">
                              <span className="text-green-600 font-bold flex-shrink-0 mt-0.5">•</span>
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* 注意事項 */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
                <h4 className="text-lg font-bold text-yellow-900 mb-3">ご利用時の注意</h4>
                <ul className="space-y-2 text-sm text-yellow-800">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 font-bold flex-shrink-0 mt-0.5">•</span>
                    <span>クーポンは1日1回まで利用可能です</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 font-bold flex-shrink-0 mt-0.5">•</span>
                    <span>利用時は必ず店員さんに画面をお見せください</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 font-bold flex-shrink-0 mt-0.5">•</span>
                    <span>一度使用したクーポンはキャンセルできません</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 font-bold flex-shrink-0 mt-0.5">•</span>
                    <span>プランに応じて利用できる店舗が異なります</span>
                  </li>
                </ul>
              </div>

              {/* サポート情報 */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                <h4 className="text-lg font-bold text-blue-900 mb-3">困ったときは</h4>
                <p className="text-sm text-blue-800 leading-relaxed">
                  ご不明な点やトラブルがございましたら、
                  メニューの「お問い合わせ」からお気軽にご連絡ください。
                  サポートチームが迅速に対応いたします。
                </p>
              </div>
            </div>
          </div>

          {/* フッター */}
          <div className="p-6 bg-white border-t border-gray-200 flex-shrink-0">
            <button
              onClick={onClose}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 px-4 rounded-xl font-bold text-lg transition-all duration-200 hover:scale-[1.02] shadow-md hover:shadow-lg"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </>
  )
}