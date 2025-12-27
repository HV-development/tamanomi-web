import { useCallback, useEffect, useRef } from "react";
import { Howl } from "howler";

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

// グローバルな音声インスタンス（コンポーネントの再レンダリングに影響されない）
let globalCouponSound: Howl | null = null as Howl | null;
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
        const AudioContextClass =
          window.AudioContext ||
          (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext ||
          AudioContext;
        globalAudioContext = new AudioContextClass();
      }
      
      // AudioContextを再開
      if (globalAudioContext?.state === 'suspended') {
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
          onloaderror: () => {
            isGlobalAudioReady = false;
          },
          onplay: () => {
          },
          onplayerror: () => {
          }
        });
      }
      
      initializationRef.current = true;
    } catch {
    }
  }, [])

  const playCouponSound = useCallback(() => {
    const playWithRetry = () => {
      const sound = globalCouponSound
      if (!sound) return
      // 再生エラー時は一度だけ再開してリトライ
      sound.off('playerror')
      sound.once('playerror', () => {
        globalAudioContext?.resume().then(() => {
          sound.play()
        })
      })
      sound.play()
    }

    // オーディオが初期化されていない場合は初期化
    if (!globalCouponSound) {
      initializeAudio()
      if (globalCouponSound) {
        if (isGlobalAudioReady) {
          playWithRetry()
        } else {
          (globalCouponSound as Howl).once('load', playWithRetry)
        }
      }
      return
    }
    
    if (!isGlobalAudioReady) {
      // ロード完了後に一度だけ再生する
      (globalCouponSound as Howl).once('load', playWithRetry)
      return
    }
    
    try {
      // AudioContextの状態を確認
      if (globalAudioContext && globalAudioContext.state === 'suspended') {
        globalAudioContext.resume().then(() => {
          playWithRetry()
        });
      } else {
        // 直接再生
        playWithRetry()
      }
    } catch {
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