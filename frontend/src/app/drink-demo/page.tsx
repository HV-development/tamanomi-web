'use client';

import DrinkAnimation from '@/components/molecules/DrinkAnimation';
import AdvancedDrinkAnimation from '@/components/molecules/AdvancedDrinkAnimation';

export default function DrinkAnimationDemo() {
  const handleAnimationComplete = () => {
    // アニメーション完了
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          飲むアニメーションデモ
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* 基本的なアニメーション */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-center">
              基本アニメーション
            </h2>
            <div className="flex justify-center">
              <DrinkAnimation
                width={200}
                height={200}
                duration={2000}
                onAnimationComplete={handleAnimationComplete}
              />
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>• クリックでアニメーション開始</p>
              <p>• drink1.svg → drink2.svg</p>
              <p>• 2秒間のアニメーション</p>
            </div>
          </div>

          {/* 高度なアニメーション */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-center">
              高度なアニメーション
            </h2>
            <div className="flex justify-center">
              <AdvancedDrinkAnimation
                width={200}
                height={200}
                duration={3000}
                onAnimationComplete={handleAnimationComplete}
                showButton={true}
              />
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>• 準備 → 飲む → 完了の3段階</p>
              <p>• 泡エフェクト付き</p>
              <p>• ステータス表示</p>
            </div>
          </div>

          {/* 自動開始アニメーション */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-center">
              自動開始アニメーション
            </h2>
            <div className="flex justify-center">
              <AdvancedDrinkAnimation
                width={200}
                height={200}
                duration={2500}
                onAnimationComplete={handleAnimationComplete}
                autoStart={true}
                showButton={false}
              />
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>• ページ読み込み時に自動開始</p>
              <p>• ボタンなし</p>
              <p>• 2.5秒間のアニメーション</p>
            </div>
          </div>

          {/* 小さなアニメーション */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-center">
              小さなアニメーション
            </h2>
            <div className="flex justify-center">
              <DrinkAnimation
                width={120}
                height={120}
                duration={1500}
                onAnimationComplete={handleAnimationComplete}
              />
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>• コンパクトサイズ</p>
              <p>• 1.5秒間のアニメーション</p>
              <p>• モバイル向け</p>
            </div>
          </div>
        </div>

        {/* 使用方法の説明 */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">使用方法</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">基本コンポーネント</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`import DrinkAnimation from '@/components/molecules/DrinkAnimation';

<DrinkAnimation
  width={200}
  height={200}
  duration={2000}
  onAnimationComplete={() => {}}
/>`}
              </pre>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">高度なコンポーネント</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
{`import AdvancedDrinkAnimation from '@/components/molecules/AdvancedDrinkAnimation';

<AdvancedDrinkAnimation
  width={200}
  height={200}
  duration={3000}
  autoStart={false}
  showButton={true}
  onAnimationComplete={() => {}}
/>`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
