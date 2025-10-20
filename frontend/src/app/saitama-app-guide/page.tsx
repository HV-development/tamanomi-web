"use client"

import { ArrowLeft, Copy, Smartphone } from "lucide-react"
import Link from "next/link"

export default function SaitamaAppGuidePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <Link 
            href="/plan-registration"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            プラン登録に戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            さいたま市みんなのアプリ 使い方ガイド
          </h1>
          <p className="text-gray-600">
            アプリのダウンロードからユーザーID取得まで、詳しい手順をご説明します。
          </p>
        </div>

        {/* アプリについて */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <div className="flex items-start gap-3">
            <Smartphone className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">さいたま市みんなのアプリについて</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                さいたま市が提供する公式アプリです。市民向けの各種サービスや情報を一元的に提供し、
                アプリと連携することで特別な割引価格でご利用いただけます。
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-blue-900 mb-2">🎉 連携特典</h3>
                <p className="text-blue-800 text-sm">
                  アプリと連携することで、月額料金が<strong>¥980 → ¥480</strong>に割引されます！
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ダウンロード手順 */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📱 アプリのダウンロード</h2>
          <div className="flex justify-center gap-4 mb-4">
            <a
              href="https://apps.apple.com/jp/app/%E3%81%95%E3%81%84%E3%81%9F%E3%81%BE%E5%B8%82%E3%81%BF%E3%82%93%E3%81%AA%E3%81%AE%E3%82%A2%E3%83%97%E3%83%AA/id6502677802"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
            >
              <img src="/app-store.svg" alt="App Storeからダウンロード" className="h-12" />
            </a>
            <a
              href="http://play.google.com/store/apps/details?id=jp.saitamacity.rsa&hl=ja&pli=1"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
            >
              <img src="/google-play.svg" alt="Google Playからダウンロード" className="h-12" />
            </a>
          </div>
          <p className="text-center text-sm text-gray-600">
            上記のボタンからアプリをダウンロードしてください
          </p>
        </div>

        {/* ユーザーID取得手順 */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <div className="flex items-start gap-3">
            <Copy className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">🔑 ユーザーIDの確認方法</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-bold text-gray-900 mb-2">1. アプリを開く</h3>
                  <p className="text-gray-700 text-sm">
                    ダウンロードした「さいたま市みんなのアプリ」を開いてください。
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-bold text-gray-900 mb-2">2. マイページにアクセス</h3>
                  <p className="text-gray-700 text-sm">
                    画面下部のメニューバーから「マイページ」をタップしてください。
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-bold text-gray-900 mb-2">3. ユーザーIDを確認</h3>
                  <p className="text-gray-700 text-sm">
                    マイページ内に「ユーザーID」が表示されます。
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-bold text-gray-900 mb-2">4. IDをコピー</h3>
                  <p className="text-gray-700 text-sm">
                    ユーザーIDをタップしてコピーし、プラン登録画面で入力してください。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 注意事項とサポート */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-lg font-bold text-yellow-900 mb-3">⚠️ 注意事項</h2>
            <ul className="space-y-2 text-yellow-800 text-sm">
              <li>• ユーザーIDは個人情報です。他人に教えないでください。</li>
              <li>• アプリのバージョンによって画面レイアウトが異なる場合があります。</li>
              <li>• ユーザーIDが見つからない場合は、アプリを最新版に更新してください。</li>
              <li>• 連携後はすぐに割引価格が適用されます。</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">🆘 サポート</h2>
            <p className="text-gray-700 text-sm mb-3">
              アプリの使い方やユーザーIDの取得でお困りの場合は、以下までお問い合わせください。
            </p>
            <div className="space-y-2 text-sm">
              <p><strong>さいたま市みんなのアプリサポート:</strong> 048-829-1111</p>
              <p><strong>受付時間:</strong> 平日 9:00-17:00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
