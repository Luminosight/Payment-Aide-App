import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  Pressable,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { Installment } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { Colors } from '../../constants/theme';
import ConfirmDialog from '../ConfirmDialog';

interface Props {
  visible: boolean;
  installment: Installment | null;
  month: string; // "YYYY-MM"
  onClose: () => void;
  onEdit: () => void; // switch to edit modal
}

export default function PaymentTrackerModal({
  visible,
  installment,
  month,
  onClose,
  onEdit,
}: Props) {
  const { state, addPayment, deletePayment, clearPaymentsForInstallment, getPaymentsForInstallment } = useApp();

  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  const user = installment
    ? state.users.find(u => u.id === installment.userId)
    : null;
  const biller = installment
    ? state.billers.find(b => b.id === installment.billerId)
    : null;

  const payments = useMemo(() => {
    if (!installment) return [];
    return getPaymentsForInstallment(installment.id, month);
  }, [installment, month, getPaymentsForInstallment]);

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = installment ? installment.monthlyAmount - totalPaid : 0;
  const paidPercent = installment
    ? Math.min((totalPaid / installment.monthlyAmount) * 100, 100)
    : 0;

  const handleAdd = () => {
    if (!installment) return;
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    addPayment(installment.id, month, val, note.trim() || undefined);
    setAmount('');
    setNote('');
  };

  const handlePayFull = () => {
    if (!installment || remaining <= 0) return;
    addPayment(
      installment.id,
      month,
      Math.round(remaining * 100) / 100,
      'Full payment',
    );
    setAmount('');
    setNote('');
  };

  const handleDeletePayment = (paymentId: string) => {
    setConfirmDelete(paymentId);
  };

  const handleClearAll = () => {
    if (!installment || payments.length === 0) return;
    setConfirmClearAll(true);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Format the month label
  const monthLabel = useMemo(() => {
    const [y, m] = month.split('-').map(Number);
    const d = new Date(y, m - 1);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [month]);

  if (!installment) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.modal}>
            {/* Header */}
            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text style={styles.headerTitle}>Payment Tracker</Text>
                <Text style={styles.headerSub}>{monthLabel}</Text>
              </View>
              <Pressable onPress={onEdit} style={styles.editBtn}>
                <Ionicons name="create-outline" size={18} color={Colors.accent} />
              </Pressable>
              <Pressable onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color={Colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView
              style={styles.content}
              keyboardShouldPersistTaps="handled"
            >
              {/* Installment Info */}
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Ionicons name="person-outline" size={16} color={Colors.textSecondary} />
                  <Text style={styles.infoText}>{user?.name ?? 'Unknown'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons
                    name="storefront-outline"
                    size={16}
                    color={Colors.textSecondary}
                  />
                  <Text style={styles.infoText}>{biller?.name ?? 'Unknown'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="cart-outline" size={16} color={Colors.textSecondary} />
                  <Text style={styles.infoText}>
                    {installment.itemDescription}
                  </Text>
                </View>
              </View>

              {/* Summary */}
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Monthly Due</Text>
                  <Text style={styles.summaryValue}>
                    {formatCurrency(installment.monthlyAmount)}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Paid</Text>
                  <Text style={[styles.summaryValue, { color: Colors.success }]}>
                    {formatCurrency(totalPaid)}
                  </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { fontWeight: '700' }]}>
                    Remaining
                  </Text>
                  <Text
                    style={[
                      styles.summaryValue,
                      {
                        color: remaining <= 0 ? Colors.success : Colors.warning,
                        fontWeight: '800',
                      },
                    ]}
                  >
                    {remaining <= 0
                      ? 'PAID'
                      : formatCurrency(Math.round(remaining * 100) / 100)}
                  </Text>
                </View>

                {/* Progress bar */}
                <View style={styles.progressBg}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${paidPercent}%`,
                        backgroundColor:
                          paidPercent >= 100 ? Colors.success : Colors.accent,
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Quick actions */}
              {remaining > 0 && (
                <View style={styles.quickRow}>
                  <Pressable
                    onPress={handlePayFull}
                    style={({ pressed }) => [
                      styles.quickBtn,
                      pressed && styles.quickBtnPressed,
                    ]}
                  >
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={16}
                      color={Colors.success}
                    />
                    <Text style={styles.quickBtnText}>
                      Mark Full ({formatCurrency(Math.round(remaining * 100) / 100)})
                    </Text>
                  </Pressable>
                </View>
              )}

              {/* Add payment */}
              {remaining > 0 && (
                <View style={styles.addSection}>
                  <Text style={styles.sectionLabel}>RECORD PAYMENT</Text>
                  <View style={styles.addRow}>
                    <TextInput
                      value={amount}
                      onChangeText={setAmount}
                      placeholder="Amount"
                      placeholderTextColor={Colors.textTertiary}
                      keyboardType="decimal-pad"
                      style={[styles.input, { flex: 1 }]}
                    />
                    <TextInput
                      value={note}
                      onChangeText={setNote}
                      placeholder="Note (optional)"
                      placeholderTextColor={Colors.textTertiary}
                      style={[styles.input, { flex: 1.5 }]}
                    />
                    <Pressable
                      onPress={handleAdd}
                      style={({ pressed }) => [
                        styles.addBtn,
                        pressed && styles.addBtnPressed,
                      ]}
                    >
                      <Ionicons name="add" size={20} color={Colors.white} />
                    </Pressable>
                  </View>
                </View>
              )}

              {/* Payment history */}
              <View style={styles.historySection}>
                <View style={styles.historyHeader}>
                  <Text style={styles.sectionLabel}>PAYMENT HISTORY</Text>
                  {payments.length > 0 && (
                    <Pressable onPress={handleClearAll} style={styles.clearAllBtn}>
                      <Ionicons name="trash-outline" size={13} color={Colors.danger} />
                      <Text style={styles.clearAllText}>Clear All</Text>
                    </Pressable>
                  )}
                </View>
                {payments.length === 0 ? (
                  <Text style={styles.emptyText}>No payments recorded yet</Text>
                ) : (
                  payments
                    .slice()
                    .sort(
                      (a, b) =>
                        new Date(b.paidAt).getTime() -
                        new Date(a.paidAt).getTime(),
                    )
                    .map(p => (
                      <View key={p.id} style={styles.paymentRow}>
                        <View style={styles.paymentInfo}>
                          <Text style={styles.paymentAmount}>
                            {formatCurrency(p.amount)}
                          </Text>
                          <Text style={styles.paymentDate}>
                            {formatDate(p.paidAt)}
                            {p.note ? `  ·  ${p.note}` : ''}
                          </Text>
                        </View>
                        <Pressable
                          onPress={() => handleDeletePayment(p.id)}
                          style={({ pressed }) => [styles.paymentDeleteBtn, pressed && styles.paymentDeletePressed]}
                        >
                          <Ionicons name="trash-outline" size={15} color={Colors.danger} />
                        </Pressable>
                      </View>
                    ))
                )}
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>

      <ConfirmDialog
        visible={!!confirmDelete}
        title="Remove Payment"
        message="Remove this payment record?"
        actions={[
          { text: 'Cancel', style: 'cancel', onPress: () => setConfirmDelete(null) },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => {
              if (confirmDelete) deletePayment(confirmDelete);
              setConfirmDelete(null);
            },
          },
        ]}
        onDismiss={() => setConfirmDelete(null)}
      />

      <ConfirmDialog
        visible={confirmClearAll}
        title="Clear All Payments"
        message={`Remove all ${payments.length} payment record${payments.length !== 1 ? 's' : ''} for this month?`}
        actions={[
          { text: 'Cancel', style: 'cancel', onPress: () => setConfirmClearAll(false) },
          {
            text: 'Clear All',
            style: 'destructive',
            onPress: () => {
              if (installment) clearPaymentsForInstallment(installment.id, month);
              setConfirmClearAll(false);
            },
          },
        ]}
        onDismiss={() => setConfirmClearAll(false)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: Colors.backdrop,
    justifyContent: 'flex-end',
  },
  keyboardView: {
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  editBtn: {
    padding: 6,
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  infoCard: {
    backgroundColor: Colors.surfaceHover,
    borderRadius: 12,
    padding: 14,
    gap: 8,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  summaryCard: {
    backgroundColor: Colors.surfaceHover,
    borderRadius: 12,
    padding: 16,
    gap: 8,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  progressBg: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  quickRow: {
    marginBottom: 12,
  },
  quickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.success,
  },
  quickBtnPressed: {
    backgroundColor: Colors.successBgLight,
  },
  quickBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.success,
  },
  addSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 10,
  },
  addRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  input: {
    backgroundColor: Colors.inputBg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  addBtn: {
    backgroundColor: Colors.accent,
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnPressed: {
    backgroundColor: Colors.accentHover,
  },
  historySection: {
    marginBottom: 32,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  clearAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: Colors.dangerBg,
  },
  clearAllText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.danger,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textTertiary,
    textAlign: 'center',
    paddingVertical: 16,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceHover,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.success,
  },
  paymentDate: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  paymentDeleteBtn: {
    padding: 6,
    borderRadius: 6,
  },
  paymentDeletePressed: {
    backgroundColor: Colors.dangerBg,
  },
});
