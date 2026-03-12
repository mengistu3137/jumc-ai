import * as FileSystem from 'expo-file-system';
import { API_BASE } from '../config';

/**
 * Upload a recorded audio file to the backend for Whisper transcription.
 *
 * @param {string} audioUri - Local file URI from expo-av
 * @returns {Promise<string|null>} Transcribed text, or null on failure
 */
export async function transcribeAudio(audioUri) {
  try {
    const response = await FileSystem.uploadAsync(
      `${API_BASE}/voice/transcribe`,
      audioUri,
      {
        fieldName: 'audio',
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        mimeType: 'audio/m4a',
      }
    );
    const data = JSON.parse(response.body);
    return data.text || null;
  } catch (err) {
    console.error('[apiService] transcribeAudio error:', err);
    return null;
  }
}

/**
 * Send a text command to the backend for interpretation and workflow execution.
 *
 * @param {{ rawText: string, doctorId: string, patientId?: string, timestamp: string }} payload
 * @returns {Promise<object>} Workflow result object
 */
export async function processCommand(payload) {
  const response = await fetch(`${API_BASE}/voice/command`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Backend error ${response.status}: ${body}`);
  }
  return response.json();
}

/**
 * Fetch the voice command history from the backend.
 *
 * @param {number} [limit=50]
 * @returns {Promise<Array>}
 */
export async function fetchHistory(limit = 50) {
  try {
    const response = await fetch(`${API_BASE}/voice/history?limit=${limit}`);
    if (!response.ok) return [];
    return response.json();
  } catch (err) {
    console.error('[apiService] fetchHistory error:', err);
    return [];
  }
}
