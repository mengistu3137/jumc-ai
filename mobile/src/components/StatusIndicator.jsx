import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const CONFIG = {
  idle:       { label: '',                    icon: null,                    color: colors.primary,   show: false },
  listening:  { label: 'Listening…',          icon: 'radio-outline',         color: '#e74c3c',        show: true  },
  processing: { label: 'Processing command…', icon: 'sync-outline',          color: colors.primary,   show: true  },
  speaking:   { label: 'Speaking…',           icon: 'volume-high-outline',   color: '#27ae60',        show: true  },
  error:      { label: 'Error — try again',   icon: 'alert-circle-outline',  color: '#e74c3c',        show: true  },
};

/**
 * Compact status strip that appears between the conversation list
 * and the mic button. Fades in/out based on the current `status` prop.
 */
export default function StatusIndicator({ status }) {
  const cfg = CONFIG[status] || CONFIG.idle;
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Fade in when visible, fade out when idle
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: cfg.show ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [status, cfg.show, fadeAnim]);

  // Spin the icon while processing
  useEffect(() => {
    let anim;
    if (status === 'processing') {
      rotateAnim.setValue(0);
      anim = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        })
      );
      anim.start();
    } else {
      rotateAnim.setValue(0);
    }
    return () => anim?.stop();
  }, [status, rotateAnim]);

  if (!cfg.show) return null;

  const spin = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          borderColor: cfg.color + '44',
          backgroundColor: cfg.color + '12',
        },
      ]}
    >
      <Animated.View
        style={status === 'processing' ? { transform: [{ rotate: spin }] } : undefined}
      >
        {cfg.icon && (
          <Ionicons name={cfg.icon} size={15} color={cfg.color} />
        )}
      </Animated.View>
      <Text style={[styles.label, { color: cfg.color }]}>{cfg.label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 20,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
