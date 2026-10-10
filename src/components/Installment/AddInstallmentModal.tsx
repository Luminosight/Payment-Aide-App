import React, { useState } from 'react';
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
import { getCurrentMonth } from '../../utils/formatters';
import { Colors } from '../../constants/theme';
import MonthSelector from './MonthSelector';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const MONTH_PRESETS = [1, 2, 3, 6, 12];

export default function AddInstallmentModal({ visible, onClose }: Props) {
  const { state, addInstallment } = useApp();

  const [billerId, setBillerId] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [amountMode, setAmountMode] = useState<'total' | 'monthly'>('monthly');
  const [numberOfMonths, setNumberOfMonths] = useState<number | null>(null);
  const [customMonths, setCustomMonths] = useState('');
  const [startMonth, setStartMonth] = useState(getCurrentMonth());
  const [userId, setUserId] = useState(state.users.find(u => u.isDefault)?.id || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setBillerId('');
    setItemDescription('');
    setTotalAmount('');
    setAmountMode('monthly');
    setNumberOfMonths(null);
    setCustomMonths('');
    setStartMonth(getCurrentMonth());
    setUserId(state.users.find(u => u.isDefault)?.id || '');
    setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!billerId) newErrors.billerId = 'Select a biller';
    if (!itemDescription.trim()) newErrors.itemDescription = 'Enter a description';
    if (!totalAmount || parseFloat(totalAmount) <= 0) newErrors.totalAmount = 'Enter a valid amount';
    const months = numberOfMonths || (customMonths ? parseInt(customMonths) : 0);
    if (!months || months < 1) newErrors.numberOfMonths = 'Select months';
    if (!userId) newErrors.userId = 'Select a user';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const months = numberOfMonths || parseInt(customMonths) || 1;
    const rawAmount = parseFloat(totalAmount);

    const finalTotal = amountMode === 'monthly' ? rawAmount * months : rawAmount;
    const finalMonthly = amountMode === 'monthly' ? rawAmount : rawAmount / months;

    addInstallment({
      billerId,
      userId,
      itemDescription: itemDescription.trim(),
      totalAmount: Math.round(finalTotal * 100) / 100,
      numberOfMonths: months,
      startMonth,
    });

    resetForm();
    onClose();
  };

  const effectiveMonths = numberOfMonths || (customMonths ? parseInt(customMonths) : 0);
  const amountPreview =
    totalAmount && effectiveMonths
      ? amountMode === 'monthly'
        ? `Total: ₱${(parseFloat(totalAmount) * effectiveMonths).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
        : `Monthly: ₱${(parseFloat(totalAmount) / effectiveMonths).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
      : null;

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
              <Text style={styles.headerTitle}>Add Installment</Text>
              <Pressable onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color={Colors.textSecondary} />
              </Pressable>
            </View>

            <ScrollView style={styles.form} keyboardShouldPersistTaps="handled">
              {/* Biller selector */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Biller</Text>
                <View style={styles.chipRow}>
                  {state.billers.map(b => (
                    <Pressable
                      key={b.id}
                      onPress={() => setBillerId(b.id)}
                      style={[
                        styles.chip,
                        billerId === b.id ? styles.chipActive : styles.chipInactive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          billerId === b.id ? styles.chipTextActive : styles.chipTextInactive,
                        ]}
                      >
                        {b.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                {errors.billerId && <Text style={styles.error}>{errors.billerId}</Text>}
              </View>

              {/* Item Description */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Item Description</Text>
                <TextInput
                  value={itemDescription}
                  onChangeText={setItemDescription}
                  placeholder="Item description"
                  placeholderTextColor={Colors.textTertiary}
                  style={[styles.input, errors.itemDescription && styles.inputError]}
                />
                {errors.itemDescription && <Text style={styles.error}>{errors.itemDescription}</Text>}
              </View>

              {/* Amount */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>
                  {amountMode === 'monthly' ? 'Amount per Month (₱)' : 'Total Amount (₱)'}
                </Text>
                <TextInput
                  value={totalAmount}
                  onChangeText={setTotalAmount}
                  placeholder="0.00"
                  placeholderTextColor={Colors.textTertiary}
                  keyboardType="decimal-pad"
                  style={[styles.input, errors.totalAmount && styles.inputError]}
                />
                <View style={styles.modeRow}>
                  <Pressable
                    onPress={() => setAmountMode('monthly')}
                    style={[styles.modeBtn, amountMode === 'monthly' && styles.modeBtnActive]}
                  >
                    <Text style={[styles.modeBtnText, amountMode === 'monthly' && styles.modeBtnTextActive]}>Per Month</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setAmountMode('total')}
                    style={[styles.modeBtn, amountMode === 'total' && styles.modeBtnActive]}
                  >
                    <Text style={[styles.modeBtnText, amountMode === 'total' && styles.modeBtnTextActive]}>Total</Text>
                  </Pressable>
                </View>
                {errors.totalAmount && <Text style={styles.error}>{errors.totalAmount}</Text>}
              </View>

              {/* Months to Pay */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Months to Pay</Text>
                <View style={styles.chipRow}>
                  {MONTH_PRESETS.map(m => (
                    <Pressable
                      key={m}
                      onPress={() => { setNumberOfMonths(m); setCustomMonths(''); }}
                      style={[
                        styles.monthChip,
                        numberOfMonths === m ? styles.chipActive : styles.chipInactive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          numberOfMonths === m ? styles.chipTextActive : styles.chipTextInactive,
                        ]}
                      >
                        {m}
                      </Text>
                    </Pressable>
                  ))}
                  <TextInput
                    value={customMonths}
                    onChangeText={v => { setCustomMonths(v); setNumberOfMonths(null); }}
                    placeholder="#"
                    placeholderTextColor={Colors.textTertiary}
                    keyboardType="number-pad"
                    style={styles.customMonthInput}
                  />
                </View>
                {errors.numberOfMonths && <Text style={styles.error}>{errors.numberOfMonths}</Text>}
                {amountPreview && (
                  <Text style={styles.preview}>{amountPreview}</Text>
                )}
              </View>

              {/* Start Month */}
              <View style={styles.field}>
                <MonthSelector value={startMonth} onChange={setStartMonth} />
              </View>

              {/* Assigned To */}
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Assigned To</Text>
                <View style={styles.chipRow}>
                  {state.users.map(u => (
                    <Pressable
                      key={u.id}
                      onPress={() => setUserId(u.id)}
                      style={[
                        styles.chip,
                        userId === u.id ? styles.chipActive : styles.chipInactive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          userId === u.id ? styles.chipTextActive : styles.chipTextInactive,
                        ]}
                      >
                        {u.name}{u.isDefault ? ' (Me)' : ''}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                {errors.userId && <Text style={styles.error}>{errors.userId}</Text>}
              </View>

              {/* Buttons */}
              <View style={styles.buttons}>
                <Pressable onPress={resetForm} style={styles.clearBtn}>
                  <Text style={styles.clearBtnText}>Clear</Text>
                </Pressable>
                <Pressable
                  onPress={handleSubmit}
                  style={({ pressed }) => [styles.saveBtn, pressed && styles.saveBtnPressed]}
                >
                  <Text style={styles.saveBtnText}>Save Installment</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  form: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.inputBg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  error: {
    fontSize: 12,
    color: Colors.danger,
    marginTop: 4,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  chipInactive: {
    backgroundColor: Colors.surfaceHover,
    borderColor: Colors.border,
  },

  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  chipTextActive: {
    color: Colors.white,
  },
  chipTextInactive: {
    color: Colors.textSecondary,
  },
  monthChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  customMonthInput: {
    width: 50,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.inputBg,
    fontSize: 13,
    textAlign: 'center',
    color: Colors.textPrimary,
  },
  preview: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    paddingBottom: 16,
  },
  clearBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  clearBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.accent,
    alignItems: 'center',
  },
  saveBtnPressed: {
    backgroundColor: Colors.accentHover,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceHover,
    alignItems: 'center',
  },
  modeBtnActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  modeBtnText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  modeBtnTextActive: {
    color: Colors.white,
  },
});
