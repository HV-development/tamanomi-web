import { useCallback, useEffect, useRef } from "react";
import { Howl } from "howler";

export const useCouponAudio = () => {
  const couponSound = useRef<Howl | null>(null);
  const isAudioReady = useRef(false);
  const audioContext = useRef<AudioContext | null>(null);

  // オーディオコンテキストを初期化
  const initializeAudio = useCallback(() => {
    console.log("🎵 Initializing audio context and Howl instance")
    
    try {
      // AudioContextを作成（ユーザーインタラクション内で実行）
      if (!audioContext.current) {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        console.log("🎵 AudioContext created:", audioContext.current.state)
      }
      
      // AudioContextを再開
      if (audioContext.current.state === 'suspended') {
        audioContext.current.resume().then(() => {
          console.log("🎵 AudioContext resumed successfully")
        });
      }
      
      // Howlインスタンスを作成
      if (!couponSound.current) {
        couponSound.current = new Howl({
          src: ['/audio/tama_voice_export.mp3'],
          volume: 0.7,
          preload: true,
          html5: true,
          onload: () => {
            console.log("🎵 Audio file loaded successfully")
            isAudioReady.current = true;
          },
          onloaderror: (id, error) => {
            console.error("🎵 Audio file load error:", error)
            isAudioReady.current = false;
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
    } catch (error) {
      console.error("🎵 Error initializing audio:", error)
    }
  }, [])

  const playCouponSound = useCallback(() => {
    console.log("🎵 playCouponSound called")
    console.log("🎵 AudioContext state:", audioContext.current?.state)
    console.log("🎵 couponSound.current:", !!couponSound.current)
    console.log("🎵 isAudioReady:", isAudioReady.current)
    
    // オーディオが初期化されていない場合は初期化
    if (!couponSound.current) {
      console.log("🎵 Audio not initialized, initializing now...")
      initializeAudio()
      // 初期化直後は再生しない（次回のクリックで再生）
      return
    }
    
    if (!isAudioReady.current) {
      console.error("🎵 Audio file not ready yet")
      return
    }
    
    try {
      console.log("🎵 Attempting to play audio...")
      
      // AudioContextの状態を確認
      if (audioContext.current && audioContext.current.state === 'suspended') {
        console.log("🎵 Resuming suspended AudioContext...")
        audioContext.current.resume().then(() => {
          console.log("🎵 AudioContext resumed, now playing audio")
          const playResult = couponSound.current!.play()
          console.log("🎵 Play result after resume:", playResult)
        });
      } else {
        // 直接再生
        const playResult = couponSound.current.play()
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

  // クリーンアップ
  useEffect(() => {
    return () => {
      console.log("🎵 Cleaning up audio resources")
      couponSound.current?.unload()
      audioContext.current?.close()
    }
  }, [])

  return { playCouponSound, initializeAudio, isAudioReady: isAudioReady.current }
}
