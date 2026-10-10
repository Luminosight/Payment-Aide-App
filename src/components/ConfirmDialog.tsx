import React from 'react';
import { View, Text, Modal, Pressable, StyleSheet } from 'react-native';
import { Colors } from '../constants/theme';

export interface ConfirmAction {
  text: string;
  style?: 'cancel' | 'destructive' | 'default';
  onPress?: () => void;
}

interface Props {
  visible: boolean;
  title: string;
  message: string;
  actions: ConfirmAction[];
  onDismiss?: () => void;
}

export default function ConfirmDialog({ visible, title, message, actions, onDismiss }: Props) {
  const cancelAction = actions.find(a => a.style === 'cancel');
  const otherActions = actions.filter(a => a.style !== 'cancel');
  const isStacked = otherActions.length > 1;

  const handleDismiss = () => {
    cancelAction?.onPress?.();
    onDismiss?.();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleDismiss}>
      <Pressable style={styles.backdrop} onPress={handleDismiss}>
        <View style={styles.dialog} onStartShouldSetResponder={() => true}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {/* Action buttons */}
          <View style={[styles.actions, isStacked && styles.actionsStacked]}>
            {otherActions.map((action, i) => {
              const isDanger = action.style === 'destructive';
              return (
                <Pressable
                  key={i}
                  onPress={() => action.onPress?.()}
                  style={({ pressed }) => [
                    styles.btn,
                    isDanger ? styles.dangerBtn : styles.primaryBtn,
                    pressed && styles.btnPressed,
                  ]}
                >
                  <Text style={[styles.btnText, isDanger && styles.dangerText]}>
                    {action.text}
                  </Text>
                </Pressable>
              );
            })}
            {cancelAction && (
              <Pressable
                onPress={() => cancelAction.onPress?.()}
                style={({ pressed }) => [styles.btn, styles.cancelBtn, pressed && styles.btnPressed]}
              >
                <Text style={styles.cancelText}>{cancelAction.text}</Text>
              </Pressable>
            )}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: Colors.backdrop,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  dialog: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 21,
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionsStacked: {
    flexDirection: 'column',
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelBtn: {
    backgroundColor: Colors.surfaceHover,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  primaryBtn: {
    backgroundColor: Colors.accent,
  },
  dangerBtn: {
    backgroundColor: Colors.danger,
  },
  btnPressed: {
    opacity: 0.75,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  btnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
  dangerText: {
    color: Colors.white,
  },
});
