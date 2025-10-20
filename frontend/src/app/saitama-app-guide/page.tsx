"use client"

import { ArrowLeft, Copy, Smartphone } from "lucide-react"
import Link from "next/link"

export default function SaitamaAppGuidePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="mb-8 text-center">
          <Link 
            href="/plan-registration"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            プラン登録に戻る
          </Link>
          <h1 className="text-base font-bold text-gray-900 mb-2">
            さいたま市みんなのアプリ 使い方ガイド
          </h1>
          <p className="text-sm text-gray-600">
            アプリのダウンロードからユーザーID取得まで、詳しい手順をご説明します。
          </p>
        </div>

        {/* Step 1: アプリのダウンロード */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="text-sm font-bold text-gray-900 mb-4 text-center">Step 1: アプリのダウンロード</h2>
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

        {/* Step 2: IDの確認 */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="text-sm font-bold text-gray-900 mb-4 text-center">Step 2: IDの確認</h2>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-bold text-gray-900 mb-2 text-sm">1. アプリを開く</h3>
              <p className="text-gray-700 text-xs">
                ダウンロードした「さいたま市みんなのアプリ」を開いてください。
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-bold text-gray-900 mb-2 text-sm">2. マイページにアクセス</h3>
              <p className="text-gray-700 text-xs">
                画面下部のメニューバーから「マイページ」をタップしてください。
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-bold text-gray-900 mb-2 text-sm">3. ユーザーIDを確認</h3>
              <p className="text-gray-700 text-xs">
                マイページ内に「ユーザーID」が表示されます。
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-bold text-gray-900 mb-2 text-sm">4. IDをコピー</h3>
              <p className="text-gray-700 text-xs">
                ユーザーIDをタップしてコピーしてください。
              </p>
            </div>
          </div>
        </div>

        {/* Step 3: IDの登録 */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="text-sm font-bold text-gray-900 mb-4 text-center">Step 3: IDの登録</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                さいたま市みんなのアプリ ユーザーID
              </label>
              <input
                type="text"
                placeholder="ユーザーIDを入力してください"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 text-sm font-bold flex items-center justify-center gap-2 rounded-lg">
              <span>🔗</span>
              アプリと連携して500円OFFで利用する
            </button>
            <p className="text-xs text-center text-gray-600">
              ※ 連携後、すぐに割引価格が適用されます
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
