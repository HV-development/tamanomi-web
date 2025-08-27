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
    console.log("🎵 Initializing audio context and Howl instance")
    
    // 既に初期化済みの場合はスキップ
    if (initializationRef.current && globalCouponSound && isGlobalAudioReady) {
      console.log("🎵 Audio already initialized and ready")
      return;
    }
    
    try {
      // AudioContextを作成（ユーザーインタラクション内で実行）
      if (!globalAudioContext) {
        globalAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        console.log("🎵 AudioContext created:", globalAudioContext.state)
      }
      
      // AudioContextを再開
      if (globalAudioContext.state === 'suspended') {
        globalAudioContext.resume().then(() => {
          console.log("🎵 AudioContext resumed successfully")
        });
      }
      
      // Howlインスタンスを作成
      if (!globalCouponSound) {
        globalCouponSound = new Howl({
          src: ['/audio/tama_voice_export.mp3'],
          volume: 0.7,
          preload: true,
          html5: true,
          onload: () => {
            console.log("🎵 Audio file loaded successfully")
            isGlobalAudioReady = true;
          },
          onloaderror: (id, error) => {
            console.error("🎵 Audio file load error:", error)
            isGlobalAudioReady = false;
          },
          onplay: () => {
            console.log("🎵 Audio playback started successfully")
          },
          onplayerror: (id, error) => {
            console.error("🎵 Audio playback error:", error)
          }
        });
        console.log("🎵 Howl instance created")
      }
      
      initializationRef.current = true;
    } catch (error) {
      console.error("🎵 Error initializing audio:", error)
    }
  }, [])

  const playCouponSound = useCallback(() => {
    console.log("🎵 playCouponSound called")
    console.log("🎵 AudioContext state:", globalAudioContext?.state)
    console.log("🎵 globalCouponSound exists:", !!globalCouponSound)
    console.log("🎵 isGlobalAudioReady:", isGlobalAudioReady)
    
    // オーディオが初期化されていない場合は初期化
    if (!globalCouponSound) {
      console.log("🎵 Audio not initialized, initializing now...")
      initializeAudio()
      // 初期化直後に再生を試行
      setTimeout(() => {
        if (globalCouponSound && isGlobalAudioReady) {
          console.log("🎵 Retrying audio play after initialization...")
          const retryResult = globalCouponSound.play()
          console.log("🎵 Retry play result:", retryResult)
        }
      }, 100)
      return
    }
    
    if (!isGlobalAudioReady) {
      console.error("🎵 Audio file not ready yet")
      return
    }
    
    try {
      console.log("🎵 Attempting to play audio...")
      
      // AudioContextの状態を確認
      if (globalAudioContext && globalAudioContext.state === 'suspended') {
        console.log("🎵 Resuming suspended AudioContext...")
        globalAudioContext.resume().then(() => {
          console.log("🎵 AudioContext resumed, now playing audio")
          const playResult = globalCouponSound!.play()
          console.log("🎵 Play result after resume:", playResult)
        });
      } else {
        // 直接再生
        const playResult = globalCouponSound.play()
        console.log("🎵 Direct play result:", playResult)
        
        if (typeof playResult === 'number' && playResult > 0) {
          console.log("🎵 Audio scheduled to play with ID:", playResult)
        } else {
          console.warn("🎵 Audio play returned unexpected result:", playResult)
        }
      }
    } catch (error) {
      console.error("🎵 Error in playCouponSound:", error)
    }
  }, [initializeAudio])

  // クリーンアップは行わない（グローバルインスタンスのため）
  useEffect(() => {
    return () => {
      console.log("🎵 Component cleanup (not cleaning global audio)")
    }
  }, [])

  return { 
    playCouponSound, 
    initializeAudio, 
    isAudioReady: isGlobalAudioReady 
  }
}