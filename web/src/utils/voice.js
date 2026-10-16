// Voice guidance using Web Speech API
let voiceEnabled = false;

export function setVoiceEnabled(enabled) {
  voiceEnabled = Boolean(enabled);
  if (!voiceEnabled && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export function isVoiceEnabled() {
  return voiceEnabled;
}

export function speak(text, lang = 'en') {
  if (!voiceEnabled || !window.speechSynthesis || !text) return;

  try {
    window.speechSynthesis.cancel(); // Stop any pending utterances
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Pick appropriate BCP-47 language tag
    if (lang === 'hi') {
      utterance.lang = 'hi-IN';
    } else if (lang === 'gu') {
      utterance.lang = 'gu-IN';
    } else {
      utterance.lang = 'en-US';
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis error:', err);
  }
}
