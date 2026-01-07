'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface AdvancedDrinkAnimationProps {
  className?: string;
  width?: number;
  height?: number;
  duration?: number;
  onAnimationComplete?: () => void;
  autoStart?: boolean; // 自動開始するかどうか
  showButton?: boolean; // ボタンを表示するかどうか
}

export default function AdvancedDrinkAnimation({
  className = '',
  width = 200,
  height = 200,
  onAnimationComplete,
  autoStart = false,
  showButton = true
}: AdvancedDrinkAnimationProps) {
  const [currentImage, setCurrentImage] = useState<'drink1' | 'drink2'>('drink1');
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (autoStart && !isAnimating && !hasAnimated) {
      setCurrentImage('drink1');
      setIsAnimating(true);
    }
  }, [autoStart, isAnimating, hasAnimated]);

  useEffect(() => {
    if (isAnimating) {
      // 0.5秒後にdrink2に切り替え
      const switchTimer = setTimeout(() => {
        setCurrentImage('drink2');
        
        // drink2で停止（ループしない）
        setTimeout(() => {
          setIsAnimating(false);
          setHasAnimated(true);
          if (!hasAnimated) {
            onAnimationComplete?.();
          }
        }, 1000);
      }, 500);

      return () => {
        clearTimeout(switchTimer);
      };
    }
  }, [isAnimating, hasAnimated, onAnimationComplete]);

  const startAnimation = useCallback(() => {
    if (!isAnimating && !hasAnimated) {
      setCurrentImage('drink1');
      setIsAnimating(true);
    }
  }, [isAnimating, hasAnimated]);

  const resetAnimation = () => {
    setCurrentImage('drink1');
    setIsAnimating(false);
    setHasAnimated(false);
  };

  return (
    <div className={`advanced-drink-animation ${className}`}>
      <div 
        className="relative transition-all duration-300"
        style={{ width, height }}
      >
        {/* メイン画像 */}
        <div className="relative">
          <Image
            src={`/${currentImage}.svg`}
            alt={currentImage === 'drink1' ? '飲む前' : '飲んでいる'}
            width={width}
            height={height}
            className="opacity-100"
            priority
          />
        </div>
        
      </div>
      
      {/* コントロールボタン */}
      {showButton && (
        <div className="mt-4 flex gap-2 justify-center">
          {!isAnimating ? (
            <button
              onClick={startAnimation}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              飲むアニメーション開始
            </button>
          ) : (
            <button
              onClick={resetAnimation}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              リセット
            </button>
          )}
        </div>
      )}
    </div>
  );
}
