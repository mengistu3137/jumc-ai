import { useState, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';

/**
 * Custom hook to manage microphone recording via expo-av.
 *
 * Usage:
 *   const { startRecording, stopRecording, isRecording, permissionGranted, requestPermission }
 *     = useAudioRecorder();
 */
export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const recordingRef = useRef(null);

  const requestPermission = useCallback(async () => {
    const { status } = await Audio.requestPermissionsAsync();
    const granted = status === 'granted';
    setPermissionGranted(granted);
    return granted;
  }, []);

  const startRecording = useCallback(async () => {
    // Configure the audio session for recording
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );

    recordingRef.current = recording;
    setIsRecording(true);
  }, []);

  const stopRecording = useCallback(async () => {
    if (!recordingRef.current) return null;
    try {
      await recordingRef.current.stopAndUnloadAsync();
      // Reset session so playback works normally afterwards
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      setIsRecording(false);
      return uri; // local file URI of the recorded audio
    } catch (err) {
      console.error('[useAudioRecorder] stopRecording error:', err);
      recordingRef.current = null;
      setIsRecording(false);
      return null;
    }
  }, []);

  return { startRecording, stopRecording, isRecording, permissionGranted, requestPermission };
}
