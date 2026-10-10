import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../src/context/AppContext';
import { Colors } from '../src/constants/theme';
import ToastContainer from '../src/components/Toast';
import ConfirmDialog from '../src/components/ConfirmDialog';

// ─── Component ───────────────────────────────────────────────

export default function SettingsScreen() {
  const { state, clearData, addToast, toasts, removeToast } = useApp();
  const [confirmClear, setConfirmClear] = useState(false);

  // ─── UI ──────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Current Data */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle-outline" size={22} color={Colors.textSecondary} />
            <Text style={styles.sectionTitle}>Current Data</Text>
          </View>
          <View style={styles.statsGrid}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{state.users.length}</Text>
              <Text style={styles.statLabel}>Users</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{state.billers.length}</Text>
              <Text style={styles.statLabel}>Billers</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{state.installments.length}</Text>
              <Text style={styles.statLabel}>Installments</Text>
            </View>
          </View>
        </View>

        {/* Clear Data */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trash-outline" size={22} color={Colors.danger} />
            <Text style={styles.sectionTitle}>Clear Data</Text>
          </View>
          <Text style={styles.sectionDesc}>
            Remove all users, billers, installments, and payment records. This cannot be undone.
          </Text>
          <Pressable
            onPress={() => setConfirmClear(true)}
            style={({ pressed }) => [styles.btn, styles.btnDanger, pressed && styles.btnPressed]}
          >
            <Ionicons name="trash-outline" size={18} color={Colors.textPrimary} />
            <Text style={styles.btnText}>Clear All Data</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Themed confirm dialog */}
      <ConfirmDialog
        visible={confirmClear}
        title="Clear All Data"
        message={'Are you sure? This will delete ALL users, billers, installments, and payment records.'}
        actions={[
          { text: 'Cancel', style: 'cancel', onPress: () => setConfirmClear(false) },
          {
            text: 'Clear Everything',
            style: 'destructive',
            onPress: () => {
              clearData();
              addToast('All data cleared');
              setConfirmClear(false);
            },
          },
        ]}
        onDismiss={() => setConfirmClear(false)}
      />

      <ToastContainer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sectionDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.accent,
  },
  btnDanger: {
    backgroundColor: Colors.danger,
  },
  btnPressed: {
    opacity: 0.8,
  },
  btnText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.surfaceHover,
    borderRadius: 10,
    paddingVertical: 12,
    gap: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
