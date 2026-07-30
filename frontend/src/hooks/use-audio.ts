import { useCallback, useEffect, useRef } from "react";
import { Howl, Howler } from "howler";

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

let globalCouponSound: Howl | null = null;
let globalAudioContext: AudioContext | null = null;
let isGlobalAudioReady = false;

const createAudioContext = (): AudioContext | null => {
  if (typeof window === "undefined") return null;

  const AudioContextClass =
    window.AudioContext ||
    window.webkitAudioContext ||
    AudioContext;

  return new AudioContextClass();
};

const resumeAudioContexts = async () => {
  const contexts = [globalAudioContext, Howler.ctx].filter(
    (context): context is AudioContext => Boolean(context)
  );

  await Promise.all(
    contexts.map(async (context) => {
      if (context.state === "suspended") {
        await context.resume().catch(() => undefined);
      }
    })
  );
};

const ensureCouponSound = () => {
  if (globalCouponSound) return globalCouponSound;

  Howler.autoUnlock = true;

  globalCouponSound = new Howl({
    src: ["/audio/tama_voice_export.mp3"],
    volume: 0.7,
    preload: true,
    html5: true,
    onload: () => {
      isGlobalAudioReady = true;
    },
    onloaderror: () => {
      isGlobalAudioReady = false;
    },
    onunlock: () => {
      isGlobalAudioReady = globalCouponSound?.state() === "loaded";
    },
  });

  if (globalCouponSound.state() === "loaded") {
    isGlobalAudioReady = true;
  }

  return globalCouponSound;
};

export const useCouponAudio = () => {
  const initializationRef = useRef(false);

  const initializeAudio = useCallback(async () => {
    if (typeof window === "undefined") return false;

    try {
      if (!globalAudioContext) {
        globalAudioContext = createAudioContext();
      }

      const sound = ensureCouponSound();
      await resumeAudioContexts();

      initializationRef.current = true;
      return Boolean(sound);
    } catch {
      return false;
    }
  }, []);

  const playCouponSound = useCallback(async () => {
    try {
      if (!globalCouponSound) {
        await initializeAudio();
      } else {
        await resumeAudioContexts();
      }

      const sound = globalCouponSound;
      if (!sound) return;

      sound.off("playerror");
      sound.once("playerror", async () => {
        await resumeAudioContexts();
        sound.play();
      });

      sound.play();
    } catch {
    }
  }, [initializeAudio]);

  useEffect(() => {
    return () => {
    };
  }, []);

  return {
    playCouponSound,
    initializeAudio,
    isAudioReady: isGlobalAudioReady,
  };
};
