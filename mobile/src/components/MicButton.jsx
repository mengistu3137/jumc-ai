import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Animated, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

/**
 * Large animated microphone button.
 *
 * Props:
 *   isListening  – whether the mic is actively recording (shows pulse)
 *   isDisabled   – disable touches while processing / speaking
 *   onPress      – callback
 */
export default function MicButton({ isListening, isDisabled, onPress }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let loop;
    if (isListening) {
      loop = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(scaleAnim, {
              toValue: 1.5,
              duration: 750,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0.45,
              duration: 750,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 750,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0,
              duration: 750,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      loop.start();
    } else {
      scaleAnim.setValue(1);
      opacityAnim.setValue(0);
    }
    return () => loop?.stop();
  }, [isListening, scaleAnim, opacityAnim]);

  return (
    <View style={styles.wrapper}>
      {/* Pulse ring rendered behind the button */}
      <Animated.View
        style={[
          styles.pulseRing,
          { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
        ]}
      />

      {/* Main button */}
      <TouchableOpacity
        style={[
          styles.button,
          isListening ? styles.buttonActive : styles.buttonIdle,
          isDisabled && styles.buttonDisabled,
        ]}
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.82}
        accessibilityRole="button"
        accessibilityLabel={isListening ? 'Stop recording' : 'Start recording'}
        accessibilityState={{ disabled: isDisabled, selected: isListening }}
      >
        <Ionicons
          name={isListening ? 'mic' : 'mic-outline'}
          size={44}
          color={isListening ? '#ffffff' : colors.primary}
        />
      </TouchableOpacity>
    </View>
  );
}

const BUTTON_SIZE = 82;
const RING_SIZE = 104;

const styles = StyleSheet.create({
  wrapper: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    backgroundColor: colors.primary,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: colors.primary,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 14,
  },
  buttonIdle: {
    backgroundColor: colors.accentLight,
  },
  buttonActive: {
    backgroundColor: colors.primary,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
});
