import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import MicButton from '../components/MicButton';
import ConversationBubble from '../components/ConversationBubble';
import StatusIndicator from '../components/StatusIndicator';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useWebSocket } from '../hooks/useWebSocket';
import { processCommand, transcribeAudio } from '../services/apiService';
import { speak, stopSpeaking } from '../services/ttsService';
import { colors } from '../theme/colors';

// In production, pull doctorId from an auth context / secure storage
const DOCTOR_ID = 'DEMO_DOCTOR_001';

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  text: 'Hello Doctor. I am ready to assist you. Tap the microphone and speak your command.',
  timestamp: new Date(),
};

export default function VoiceAssistantScreen() {
  const [conversation, setConversation] = useState([WELCOME_MESSAGE]);
  // idle | listening | processing | speaking | error
  const [status, setStatus] = useState('idle');
  const [patientId, setPatientId] = useState('');

  const flatListRef = useRef(null);

  const { startRecording, stopRecording, isRecording, permissionGranted, requestPermission } =
    useAudioRecorder();

  // Receive real-time notifications from the backend over WebSocket
  const onNotification = useCallback((data) => {
    const msg = data.data?.message || data.message || JSON.stringify(data.data || data);
    appendMessage('assistant', `[Notification] ${msg}`);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useWebSocket(onNotification);

  /** Append a new message to the conversation list. */
  const appendMessage = useCallback((role, text, meta) => {
    const entry = { id: `${role}-${Date.now()}`, role, text, timestamp: new Date(), meta };
    setConversation((prev) => [...prev, entry]);
    // Scroll to newest message
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 120);
  }, []);

  /** Remove temporary system messages (e.g. "Transcribing…"). */
  const clearSystemMessages = useCallback(() => {
    setConversation((prev) => prev.filter((m) => m.role !== 'system'));
  }, []);

  const handleMicPress = useCallback(async () => {
    // ── Stop recording path ──────────────────────────────────────────────────
    if (status === 'listening') {
      try {
        setStatus('processing');
        const audioUri = await stopRecording();
        if (!audioUri) { setStatus('idle'); return; }

        appendMessage('system', 'Transcribing speech…');

        const transcribed = await transcribeAudio(audioUri);
        clearSystemMessages();

        if (!transcribed) {
          appendMessage('assistant', 'Sorry, I could not understand that. Please try again.');
          setStatus('idle');
          return;
        }

        // Show what the doctor said
        appendMessage('doctor', transcribed);

        // Send to backend for interpretation + workflow
        const result = await processCommand({
          rawText: transcribed,
          doctorId: DOCTOR_ID,
          patientId: patientId.trim() || undefined,
          timestamp: new Date().toISOString(),
        });

        const responseText =
          result.response || result.message || 'Command processed successfully.';
        appendMessage('assistant', responseText, result);

        // Voice feedback
        setStatus('speaking');
        await speak(responseText);
        setStatus('idle');
      } catch (err) {
        console.error('[VoiceAssistant] error:', err);
        clearSystemMessages();
        appendMessage('assistant', 'An error occurred. Please try again.');
        setStatus('error');
        setTimeout(() => setStatus('idle'), 2500);
      }
      return;
    }

    // ── Start recording path ─────────────────────────────────────────────────
    if (!permissionGranted) {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert(
          'Microphone Permission Required',
          'Please enable microphone access in your device settings to use voice commands.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    try {
      await stopSpeaking(); // stop any ongoing TTS
      await startRecording();
      setStatus('listening');
    } catch (err) {
      console.error('[VoiceAssistant] startRecording error:', err);
      appendMessage('assistant', 'Could not start recording. Check microphone permissions.');
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2500);
    }
  }, [
    status,
    permissionGranted,
    requestPermission,
    startRecording,
    stopRecording,
    patientId,
    appendMessage,
    clearSystemMessages,
  ]);

  const micLabel = {
    idle: 'Tap to speak',
    listening: 'Tap to stop',
    processing: 'Processing…',
    speaking: 'Speaking…',
    error: 'Try again',
  }[status];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Patient ID bar */}
      <View style={styles.patientBar}>
        <Ionicons name="person-outline" size={16} color={colors.textSecondary} />
        <TextInput
          style={styles.patientInput}
          placeholder="Patient ID (optional)"
          placeholderTextColor={colors.textSecondary}
          value={patientId}
          onChangeText={setPatientId}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {patientId.length > 0 && (
          <TouchableOpacity onPress={() => setPatientId('')}>
            <Ionicons name="close-circle-outline" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Conversation */}
      <FlatList
        ref={flatListRef}
        data={conversation}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ConversationBubble item={item} />}
        contentContainerStyle={styles.listContent}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Status indicator */}
      <StatusIndicator status={status} />

      {/* Mic button */}
      <View style={styles.micContainer}>
        <MicButton
          isListening={status === 'listening'}
          isDisabled={status === 'processing' || status === 'speaking'}
          onPress={handleMicPress}
        />
        <Text style={styles.micLabel}>{micLabel}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  patientBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.accentLight,
    gap: 8,
  },
  patientInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
  },
  list: { flex: 1 },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 8,
  },
  micContainer: {
    alignItems: 'center',
    paddingBottom: 28,
    paddingTop: 14,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.accentLight,
  },
  micLabel: {
    marginTop: 10,
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});
