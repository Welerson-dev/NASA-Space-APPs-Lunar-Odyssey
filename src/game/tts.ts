class TtsManager {
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  stop(): void {
    if (!this.isSupported()) return;
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore synthesis cancel errors in restricted browsers
    }
    this.currentUtterance = null;
  }

  speak(text: string, onEnd?: () => void): void {
    if (!this.isSupported()) {
      onEnd?.();
      return;
    }
    this.stop();
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.02;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const ptVoice =
        voices.find((v) => v.lang.toLowerCase().startsWith('pt-br')) ||
        voices.find((v) => v.lang.toLowerCase().startsWith('pt'));
      if (ptVoice) utterance.voice = ptVoice;

      utterance.onend = () => {
        if (this.currentUtterance === utterance) {
          this.currentUtterance = null;
          onEnd?.();
        }
      };
      utterance.onerror = () => {
        if (this.currentUtterance === utterance) {
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
