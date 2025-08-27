import { useCallback, useEffect, useRef } from "react";
import { Howl } from "howler";

// グローバルな音声インスタンス（コンポーネントの再レンダリングに影響されない）
let globalCouponSound: Howl | null = null;
let globalAudioContext: AudioContext | null = null;
let isGlobalAudioReady = false;

export const useCouponAudio = () => {
  const initializationRef = useRef(false);

  // オーディオコンテキストを初期化
  const initializeAudio = useCallback(() => {
    // 既に初期化済みの場合はスキップ
    if (initializationRef.current && globalCouponSound && isGlobalAudioReady) {
      return;
    }
    
    try {
      // AudioContextを作成（ユーザーインタラクション内で実行）
      if (!globalAudioContext) {
        globalAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      // AudioContextを再開
      if (globalAudioContext.state === 'suspended') {
        globalAudioContext.resume();
      }
      
      // Howlインスタンスを作成
      if (!globalCouponSound) {
        globalCouponSound = new Howl({
          src: ['/audio/tama_voice_export.mp3'],
          volume: 0.7,
          preload: true,
          html5: true,
          onload: () => {
            isGlobalAudioReady = true;
          },
          onloaderror: (id, error) => {
            isGlobalAudioReady = false;
          },
          onplay: () => {
          },
          onplayerror: (id, error) => {
          }
        });
      }
      
      initializationRef.current = true;
    } catch (error) {
    }
  }, [])

  const playCouponSound = useCallback(() => {
    // オーディオが初期化されていない場合は初期化
    if (!globalCouponSound) {
      initializeAudio()
      // 初期化直後に再生を試行
      setTimeout(() => {
        if (globalCouponSound && isGlobalAudioReady) {
          globalCouponSound.play()
        }
      }, 100)
      return
    }
    
    if (!isGlobalAudioReady) {
      return
    }
    
    try {
      // AudioContextの状態を確認
      if (globalAudioContext && globalAudioContext.state === 'suspended') {
        globalAudioContext.resume().then(() => {
          globalCouponSound!.play()
        });
      } else {
        // 直接再生
        globalCouponSound.play()
      }
    } catch (error) {
    }
  }, [initializeAudio])

  // クリーンアップは行わない（グローバルインスタンスのため）
  useEffect(() => {
    return () => {
    }
  }, [])

  return { 
    playCouponSound, 
    initializeAudio, 
    isAudioReady: isGlobalAudioReady 
  }
}