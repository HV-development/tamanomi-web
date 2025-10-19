'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface DrinkAnimationProps {
  className?: string;
  width?: number;
  height?: number;
  duration?: number; // アニメーションの持続時間（ミリ秒）
  onAnimationComplete?: () => void;
}

export default function DrinkAnimation({
  className = '',
  width = 200,
  height = 200,
  onAnimationComplete
}: DrinkAnimationProps) {
  const [currentImage, setCurrentImage] = useState<'drink1' | 'drink2'>('drink1');
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (isAnimating) {
      // 0.5秒後にdrink2に切り替え
      const switchTimer = setTimeout(() => {
        setCurrentImage('drink2');
      }, 500);

      // drink2で停止（ループしない）
      const completeTimer = setTimeout(() => {
        setIsAnimating(false);
        setHasAnimated(true);
        onAnimationComplete?.();
      }, 1000);

      return () => {
        clearTimeout(switchTimer);
        clearTimeout(completeTimer);
      };
    }
  }, [isAnimating, onAnimationComplete]);

  const startAnimation = () => {

    if (!isAnimating && !hasAnimated) {
      // 強制的にリセットしてから開始
      setCurrentImage('drink1');
      setIsAnimating(false);

      // 少し遅延してからアニメーション開始
      setTimeout(() => {
        setIsAnimating(true);
      }, 100);
    }
  };

  return (
    <div className={`drink-animation-container ${className}`}>
      <div
        className="relative cursor-pointer transition-transform hover:scale-105"
        onClick={startAnimation}
        style={{ width, height }}
      >
        <Image
          src={`/${currentImage}.svg`}
          alt={currentImage === 'drink1' ? '飲む前' : '飲んでいる'}
          width={width}
          height={height}
          className="opacity-100"
          priority
          onLoad={() => { }}
          onError={() => { }}
        />
        {/* デバッグ情報 */}
        <div className="absolute top-0 left-0 bg-black text-white text-xs p-1 rounded">
          {currentImage} | {isAnimating ? 'Animating' : 'Idle'}
        </div>
      </div>

      {/* ボタン群 */}
      <div className="mt-4 flex gap-2 justify-center">
        <button
          onClick={startAnimation}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          アニメーション開始
        </button>

        <button
          onClick={() => {
            setCurrentImage('drink1');
            setIsAnimating(false);
            setAnimationPhase('idle');
            setHasAnimated(false);
          }}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          リセット
        </button>
      </div>

      {/* 状態表示 */}
      <div className="mt-2 text-center text-sm">
        <p>状態: {isAnimating ? 'アニメーション中' : '待機中'}</p>
        <p>画像: {currentImage}</p>
      </div>
    </div>
  );
}
