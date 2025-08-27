import { useCallback, useEffect, useRef } from "react";
import { Howl } from "howler";

export const useCouponAudio = () => {

    const couponSound = useRef<Howl | null>(null);

    useEffect(() => {
        couponSound.current = new Howl({
            src: ['/audio/tama_voice_export.mp3'],  // 音声ファイルのパス
            volume: 0.5,                       // 音量（0.0〜1.0）
            preload: true,                     // 事前読み込み
            html5: true                        // HTML5 Audio APIを使用
        });

        return () => {
            couponSound.current?.unload()
        }
    }, [])

    const playCouponSound = useCallback(() => {
        couponSound.current?.play()
    }, [])

    return { playCouponSound }
}
