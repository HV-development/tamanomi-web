'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function SimpleDrinkTest2() {
  const [currentImage, setCurrentImage] = useState<'drink1' | 'drink2'>('drink1');
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    console.log('Button clicked!');
    console.log('Current state:', { currentImage, isAnimating });

    if (!isAnimating) {
      setIsAnimating(true);
      setCurrentImage('drink1');

      // 1秒後にdrink2に切り替え
      setTimeout(() => {
        console.log('Switching to drink2');
        setCurrentImage('drink2');

        // 2秒後にリセット
        setTimeout(() => {
          console.log('Resetting to drink1');
          setCurrentImage('drink1');
          setIsAnimating(false);
        }, 2000);
      }, 1000);
    }
  };

  return (
    <div className="p-8 border-2 border-red-500">
      <h2 className="text-2xl font-bold mb-4">超シンプルテスト</h2>

      {/* 状態表示 */}
      <div className="mb-4 p-2 bg-gray-100 rounded">
        <p>画像: {currentImage}</p>
        <p>アニメーション中: {isAnimating ? 'Yes' : 'No'}</p>
      </div>

      {/* ボタン */}
      <button
        onClick={handleClick}
        disabled={isAnimating}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 mb-4"
      >
        {isAnimating ? 'アニメーション中...' : 'アニメーション開始'}
      </button>

      {/* 画像表示 */}
      <div className="w-32 h-32 border-2 border-blue-300 bg-gray-50 flex items-center justify-center relative">
        <Image
          src={`/${currentImage}.svg`}
          alt={currentImage === 'drink1' ? '飲む前' : '飲んでいる'}
          width={96}
          height={96}
          className="object-contain"
          onLoad={() => console.log(`Image loaded: ${currentImage}.svg`)}
          onError={() => { }}
        />
      </div>

      {/* デバッグ情報 */}
      <div className="mt-4 text-xs text-gray-600">
        <p>画像パス: /{currentImage}.svg</p>
        <p>タイムスタンプ: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
}
