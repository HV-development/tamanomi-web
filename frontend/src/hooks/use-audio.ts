import { useCallback, useEffect, useRef } from "react";
import { Howl } from "howler";

export const useCouponAudio = () => {

    const couponSound = useRef<Howl | null>(null);

    useEffect(() => {
        console.log("🎵 useCouponAudio: Initializing Howl instance")
        couponSound.current = new Howl({
            src: ['/audio/tama_voice_export.mp3'],  // 音声ファイルのパス
            volume: 0.5,                       // 音量（0.0〜1.0）
            preload: true,                     // 事前読み込み
            html5: true,                       // HTML5 Audio APIを使用
            onload: () => {
                console.log("🎵 Audio file loaded successfully")
            },
            onloaderror: (id, error) => {
                console.error("🎵 Audio file load error:", error)
            },
            onplay: () => {
                console.log("🎵 Audio playback started")
            },
            onplayerror: (id, error) => {
                console.error("🎵 Audio playback error:", error)
            }
        });
        console.log("🎵 Howl instance created:", couponSound.current)

        return () => {
            console.log("🎵 Cleaning up Howl instance")
            couponSound.current?.unload()
        }
    }, [])

    const playCouponSound = useCallback(() => {
        console.log("🎵 playCouponSound called")
        console.log("🎵 couponSound.current:", couponSound.current)
        
        if (!couponSound.current) {
            console.error("🎵 No audio instance available")
            return
        }
        
        try {
            console.log("🎵 Attempting to play audio...")
            const playResult = couponSound.current.play()
            console.log("🎵 Play result:", playResult)
        } catch (error) {
            console.error("🎵 Error in playCouponSound:", error)
        }
    }, [])

    return { playCouponSound }
}
