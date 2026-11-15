export type Language = 'pt' | 'en';

export interface AudioClip {
  src: string;
  start?: number;
  end?: number;
}

const MALE_VOICE_HINTS = [
  'daniel',
  'alex',
  'fred',
  'david',
  'mark',
  'guy',
  'andrew',
  'brian',
  'ryan',
  'christopher',
  'eric',
  'george',
  'arthur',
  'james',
  'matthew',
  'paul',
  'richard',
  'thomas',
  'william',
  'oliver',
  'harry',
  'aaron',
  'rishi',
  'lee',
  'male',
];

const FEMALE_VOICE_HINTS = [
  'samantha',
  'victoria',
  'karen',
  'zira',
  'aria',
  'jenny',
  'emma',
  'sonia',
  'libby',
  'hazel',
  'susan',
  'tessa',
  'moira',
  'fiona',
  'serena',
  'allison',
  'ava',
  'kate',
  'sara',
  'female',
];

export function selectEnglishMaleVoice(
  voices: Pick<SpeechSynthesisVoice, 'name' | 'lang'>[]
): Pick<SpeechSynthesisVoice, 'name' | 'lang'> | undefined {
  const enVoices = voices.filter((v) => v.lang.toLowerCase().startsWith('en'));
  if (enVoices.length === 0) return undefined;

  const explicitMale = enVoices.find((v) => {
    const name = v.name.toLowerCase();
    return MALE_VOICE_HINTS.some((hint) => name.includes(hint));
  });
  if (explicitMale) return explicitMale;

  const nonFemale = enVoices.find((v) => {
    const name = v.name.toLowerCase();
    return !FEMALE_VOICE_HINTS.some((hint) => name.includes(hint));
  });
  return nonFemale ?? enVoices[0];
}

class TtsManager {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private clipMonitorRaf: number | null = null;
  private activeToken = 0;
  private mpegBlobCache = new Map<string, string>();

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.getVoices();
      } catch {
        // Ignore initialization error in restricted environments
      }
    }
  }

  isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  private clearAudio(): void {
    if (this.clipMonitorRaf !== null && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(this.clipMonitorRaf);
      this.clipMonitorRaf = null;
    }
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.onended = null;
        this.currentAudio.onerror = null;
      } catch {
        // Ignore audio cleanup errors
      }
      this.currentAudio = null;
    }
  }

  stop(): void {
    this.activeToken += 1;
    this.clearAudio();
    if (this.isSupported()) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore synthesis cancel errors in restricted browsers
      }
    }
    this.currentUtterance = null;
  }

  private async fetchMpegAudioBlobUrl(src: string): Promise<string | null> {
    const existing = this.mpegBlobCache.get(src);
    if (existing) return existing;
    if (typeof fetch === 'undefined' || typeof URL === 'undefined') return null;
    try {
      const res = await fetch(src);
      if (!res.ok) return null;
      const buf = await res.arrayBuffer();
      const blobUrl = URL.createObjectURL(new Blob([buf], { type: 'audio/mpeg' }));
      this.mpegBlobCache.set(src, blobUrl);
      return blobUrl;
    } catch {
      return null;
    }
  }

  private playAudioClip(
    clip: AudioClip,
    token: number,
    onEnd?: () => void,
    onErrorFallback?: () => void,
    overrideSrc?: string
  ): void {
    if (typeof Audio === 'undefined') {
      onErrorFallback?.();
      return;
    }

    const srcToPlay = overrideSrc ?? this.mpegBlobCache.get(clip.src) ?? clip.src;

    try {
      const audio = new Audio(srcToPlay);
      audio.preload = 'auto';
      this.currentAudio = audio;

      const startTime = Math.max(0, clip.start ?? 0);
      const endTime = clip.end;
      let finished = false;

      const finish = () => {
        if (finished || this.activeToken !== token) return;
        finished = true;
        this.clearAudio();
        onEnd?.();
      };

      audio.onended = finish;
      audio.onerror = () => {
        if (finished || this.activeToken !== token) return;
        finished = true;
        this.clearAudio();
        if (!overrideSrc && clip.src.toLowerCase().endsWith('.mpeg')) {
          this.fetchMpegAudioBlobUrl(clip.src).then((blobUrl) => {
            if (this.activeToken !== token) return;
            if (blobUrl) {
              this.playAudioClip(clip, token, onEnd, onErrorFallback, blobUrl);
            } else if (onErrorFallback) {
              onErrorFallback();
            } else {
              onEnd?.();
            }
          });
          return;
        }
        if (onErrorFallback) onErrorFallback();
        else onEnd?.();
      };

      const startPlayback = () => {
        if (finished || this.activeToken !== token) return;
        try {
          if (startTime > 0 && Math.abs(audio.currentTime - startTime) > 0.05) {
            audio.currentTime = startTime;
          }
        } catch {
          // Ignore seek errors on unbuffered streams
        }

        const monitor = () => {
          if (finished || this.activeToken !== token || this.currentAudio !== audio) return;
          if (endTime !== undefined && audio.currentTime >= endTime) {
            finish();
            return;
          }
          if (!audio.paused && !audio.ended) {
            this.clipMonitorRaf = requestAnimationFrame(monitor);
          }
        };

        const playPromise = audio.play();
        if (endTime !== undefined && typeof requestAnimationFrame !== 'undefined') {
          this.clipMonitorRaf = requestAnimationFrame(monitor);
        }
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(() => {
            if (finished || this.activeToken !== token) return;
            finished = true;
            this.clearAudio();
            onEnd?.();
          });
        }
      };

      if (audio.readyState >= 1) {
        startPlayback();
      } else {
        audio.addEventListener('loadedmetadata', startPlayback, { once: true });
        audio.load();
      }
    } catch {
      onErrorFallback ? onErrorFallback() : onEnd?.();
    }
  }

  speak(
    text: string,
    lang: Language = 'pt',
    onEnd?: () => void,
    clip?: AudioClip
  ): void {
    this.stop();
    const token = this.activeToken;

    if (clip) {
      this.playAudioClip(clip, token, onEnd, () => {
        this.speakWithSynthesis(text, lang, token, onEnd);
      });
      return;
    }

    this.speakWithSynthesis(text, lang, token, onEnd);
  }

  private speakWithSynthesis(
    text: string,
    lang: Language,
    token: number,
    onEnd?: () => void
  ): void {
    if (!this.isSupported()) {
      onEnd?.();
      return;
    }
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();

      if (lang === 'en') {
        utterance.lang = 'en-US';
        utterance.rate = 0.98;
        utterance.pitch = 0.85;
        const maleVoice = selectEnglishMaleVoice(voices) as SpeechSynthesisVoice | undefined;
        if (maleVoice) utterance.voice = maleVoice;
      } else {
        utterance.lang = 'pt-BR';
        utterance.rate = 1.02;
        utterance.pitch = 1.0;
        const ptVoice =
          voices.find((v) => v.lang.toLowerCase().startsWith('pt-br')) ||
          voices.find((v) => v.lang.toLowerCase().startsWith('pt'));
        if (ptVoice) utterance.voice = ptVoice;
      }

      utterance.onend = () => {
        if (this.activeToken === token && this.currentUtterance === utterance) {
          this.currentUtterance = null;
          onEnd?.();
        }
      };
      utterance.onerror = () => {
        if (this.activeToken === token && this.currentUtterance === utterance) {
          this.currentUtterance = null;
          onEnd?.();
        }
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch {
      onEnd?.();
    }
  }
}

export const tts = new TtsManager();
