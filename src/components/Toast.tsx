import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { useApp } from '../context/AppContext';
import { Colors } from '../constants/theme';

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  return (
    <View style={styles.container} pointerEvents="box-none">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </View>
  );
}

function ToastItem({ toast, onDismiss }: { toast: { id: string; message: string; type: string }; onDismiss: () => void }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
  }, []);

  const bgColor =
    toast.type === 'success' ? Colors.success :
    toast.type === 'error' ? Colors.danger : Colors.accent;

  return (
    <Animated.View style={[styles.toast, { backgroundColor: bgColor, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <Pressable onPress={onDismiss}>
        <Text style={styles.toastText}>{toast.message}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 32,
    left: '5%',
    right: '5%',
    alignItems: 'center',
    gap: 8,
  },
  toast: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  toastText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
