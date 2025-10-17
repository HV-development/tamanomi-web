"use client"

import React, { useState, useEffect } from "react"
import { PerformanceComparison } from "../../components/testing/performance-comparison"
import { PerformanceDashboard } from "../../components/testing/performance-dashboard"
import { WebVitalsDisplay } from "../../components/testing/web-vitals"
import { ActualPerformanceTest } from "../../components/testing/actual-performance-test"

// パフォーマンステストページ
export default function PerformanceTestPage() {
  const [activeTab, setActiveTab] = useState<'comparison' | 'realtime' | 'webvitals' | 'actual'>('comparison')

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">🚀 MyPage パフォーマンステスト</h1>

        {/* タブナビゲーション */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setActiveTab('comparison')}
              className={`px-4 py-2 rounded-md transition-colors ${activeTab === 'comparison'
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              📊 比較テスト
            </button>
            <button
              onClick={() => setActiveTab('realtime')}
              className={`px-4 py-2 rounded-md transition-colors ${activeTab === 'realtime'
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              ⚡ リアルタイム監視
            </button>
            <button
              onClick={() => setActiveTab('webvitals')}
              className={`px-4 py-2 rounded-md transition-colors ${activeTab === 'webvitals'
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              📈 Web Vitals
            </button>
            <button
              onClick={() => setActiveTab('actual')}
              className={`px-4 py-2 rounded-md transition-colors ${activeTab === 'actual'
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              🔬 実際のテスト
            </button>
          </div>
        </div>

        {/* タブコンテンツ */}
        <div className="space-y-6">
          {activeTab === 'comparison' && (
            <div>
              <PerformanceComparison />
            </div>
          )}

          {activeTab === 'realtime' && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6 text-center">⚡ リアルタイムパフォーマンス監視</h2>
              <div className="text-center text-gray-600 mb-4">
                右上のパフォーマンスモニターでリアルタイムのFPSとメモリ使用量を確認できます
              </div>
              <PerformanceDashboard />
            </div>
          )}

          {activeTab === 'webvitals' && (
            <div className="max-w-2xl mx-auto">
              <WebVitalsDisplay />
            </div>
          )}

          {activeTab === 'actual' && (
            <div>
              <ActualPerformanceTest />
            </div>
          )}
        </div>

        {/* テスト結果の説明 */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-center">📋 テスト結果の解釈</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-green-700 mb-3">✅ 期待される改善効果</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• <strong>レンダリング時間:</strong> 50-75% 短縮</li>
                <li>• <strong>データ読み込み:</strong> 60-80% 高速化</li>
                <li>• <strong>メモリ使用量:</strong> 30-50% 削減</li>
                <li>• <strong>FPS:</strong> 55-60fps 維持</li>
                <li>• <strong>First Contentful Paint:</strong> 1.8秒以下</li>
                <li>• <strong>Largest Contentful Paint:</strong> 2.5秒以下</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-blue-700 mb-3">🔧 最適化技術</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• <strong>React.memo:</strong> 不要な再レンダリング防止</li>
                <li>• <strong>useMemo:</strong> 重い計算のキャッシュ</li>
                <li>• <strong>スケルトン:</strong> 即座のUI表示</li>
                <li>• <strong>遅延読み込み:</strong> バンドル分割</li>
                <li>• <strong>プリロード:</strong> データの事前読み込み</li>
                <li>• <strong>プログレッシブ:</strong> 段階的表示</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">⚠️ 注意事項</h4>
            <p className="text-sm text-yellow-700">
              このテストはシミュレーションです。実際の改善効果は、デバイスの性能、ネットワーク環境、
              データ量によって異なります。本番環境での測定を推奨します。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
