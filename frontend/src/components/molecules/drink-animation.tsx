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
  duration = 2000, // デフォルト2秒
  onAnimationComplete
}: DrinkAnimationProps) {
  const [currentImage, setCurrentImage] = useState<'drink1' | 'drink2'>('drink1');
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'switching' | 'drinking' | 'resetting'>('idle');

  useEffect(() => {
    console.log('useEffect triggered, isAnimating:', isAnimating);
    if (isAnimating) {
      console.log('Setting up animation timers...');
      setAnimationPhase('switching');
      
      // 0.5秒後にdrink2に切り替え
      const switchTimer = setTimeout(() => {
        console.log('Switching to drink2');
        setCurrentImage('drink2');
        setAnimationPhase('drinking');
      }, 500);
      
      // drink2で停止（ループしない）
      const completeTimer = setTimeout(() => {
        console.log('Animation complete');
        setIsAnimating(false);
        setHasAnimated(true);
        onAnimationComplete?.();
      }, 1000);

      return () => {
        console.log('Cleaning up timers');
        clearTimeout(switchTimer);
        clearTimeout(completeTimer);
      };
    }
  }, [isAnimating]);

  const startAnimation = () => {
    console.log('startAnimation called, isAnimating:', isAnimating);
    console.log('Current image before start:', currentImage);
    
    if (!isAnimating && !hasAnimated) {
      // 強制的にリセットしてから開始
      setCurrentImage('drink1');
      setIsAnimating(false);
      setAnimationPhase('idle');
      
      // 少し遅延してからアニメーション開始
      setTimeout(() => {
        console.log('Starting animation after reset...');
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
          onLoad={() => console.log(`Image loaded: ${currentImage}.svg`)}
          onError={(e) => console.error(`Image load error: ${currentImage}.svg`, e)}
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
            console.log('Manual reset');
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
        <p>フェーズ: {animationPhase}</p>
        <p>画像: {currentImage}</p>
      </div>
    </div>
  );
}
