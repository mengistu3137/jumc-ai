import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

/**
 * Renders a single message bubble in the conversation list.
 *
 * Roles:
 *   'doctor'    – right-aligned, primary colour background
 *   'assistant' – left-aligned, soft background
 *   'system'    – centred small italic text (transient status messages)
 */
export default function ConversationBubble({ item }) {
  const { role, text, timestamp, meta } = item;

  if (role === 'system') {
    return (
      <View style={styles.systemRow}>
        <Text style={styles.systemText}>{text}</Text>
      </View>
    );
  }

  const isDoctor = role === 'doctor';
  const timeStr = new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={[styles.row, isDoctor ? styles.rowRight : styles.rowLeft]}>
      {/* Avatar — only shown for the assistant */}
      {!isDoctor && (
        <View style={styles.avatar}>
          <Ionicons name="hardware-chip-outline" size={18} color={colors.primary} />
        </View>
      )}

      <View
        style={[
          styles.bubble,
          isDoctor ? styles.doctorBubble : styles.assistantBubble,
        ]}
      >
        <Text style={isDoctor ? styles.senderLabelRight : styles.senderLabelLeft}>
          {isDoctor ? 'You' : 'JUMC AI'}
        </Text>

        <Text style={isDoctor ? styles.doctorText : styles.assistantText}>{text}</Text>

        {/* Structured action badge (shown when backend returns a parsed command) */}
        {meta?.action && meta.action !== 'unknown' && (
          <ActionBadge meta={meta} />
        )}

        <Text style={isDoctor ? styles.timeRight : styles.timeLeft}>{timeStr}</Text>
      </View>

      {/* Avatar — only shown for the doctor */}
      {isDoctor && (
        <View style={styles.avatar}>
          <Ionicons name="person-circle-outline" size={18} color={colors.textSecondary} />
        </View>
      )}
    </View>
  );
}

/** Compact badge showing the structured command fields returned by the AI. */
function ActionBadge({ meta }) {
  const { action, drug, dosage, frequency, duration, test, target, note } = meta;

  const parts = [
    action?.toUpperCase(),
    drug,
    dosage,
    frequency && `• ${frequency}`,
    duration && `for ${duration}`,
    test,
    target,
    note,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <View style={styles.actionBadge}>
      <Ionicons name="checkmark-circle-outline" size={13} color="#27ae60" />
      <Text style={styles.actionText} numberOfLines={2}>
        {parts}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 3,
    gap: 8,
  },
  rowLeft: { justifyContent: 'flex-start' },
  rowRight: { justifyContent: 'flex-end' },

  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.accentLight,
  },

  bubble: {
    maxWidth: '76%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  doctorBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: colors.accentSoft,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.accentLight,
  },

  senderLabelLeft: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 3,
    opacity: 0.8,
  },
  senderLabelRight: {
    fontSize: 11,
    fontWeight: '700',
    color: '#dfeafc',
    marginBottom: 3,
    opacity: 0.9,
  },

  doctorText: { color: '#fff', fontSize: 15, lineHeight: 22 },
  assistantText: { color: colors.textPrimary, fontSize: 15, lineHeight: 22 },

  actionBadge: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    marginTop: 7,
    backgroundColor: '#e8f8f0',
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 12,
    color: '#27ae60',
    fontWeight: '600',
    flex: 1,
    lineHeight: 17,
  },

  timeLeft: {
    fontSize: 10,
    marginTop: 5,
    color: colors.textSecondary,
    opacity: 0.7,
  },
  timeRight: {
    fontSize: 10,
    marginTop: 5,
    color: '#dfeafc',
    opacity: 0.8,
    textAlign: 'right',
  },

  systemRow: { alignItems: 'center', marginVertical: 6 },
  systemText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
});
