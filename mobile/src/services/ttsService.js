import * as Speech from 'expo-speech';

/**
 * Speak the given text using the device's TTS engine.
 * Resolves when speech finishes (or on error, so the app never hangs).
 *
 * @param {string} text
 * @returns {Promise<void>}
 */
export function speak(text) {
  return new Promise((resolve) => {
    Speech.speak(text, {
      language: 'en-US',
      pitch: 1.0,
      rate: 0.95,
      onDone:  resolve,
      onError: resolve, // resolve even on error
    });
  });
}

/**
 * Immediately stop any ongoing TTS output.
 * @returns {Promise<void>}
 */
export async function stopSpeaking() {
  await Speech.stop();
}
