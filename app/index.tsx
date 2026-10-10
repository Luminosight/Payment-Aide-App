import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../src/context/AppContext';
import { getOverallSummary, getActiveInstallments } from '../src/utils/calculations';
import { formatCurrency, formatMonth, getCurrentMonth, getOrdinalSuffix } from '../src/utils/formatters';
import { Colors } from '../src/constants/theme';
import { Installment } from '../src/types';
import AddInstallmentModal from '../src/components/Installment/AddInstallmentModal';
import EditInstallmentModal from '../src/components/Installment/EditInstallmentModal';
import PaymentTrackerModal from '../src/components/Installment/PaymentTrackerModal';
import ToastContainer from '../src/components/Toast';

function monthToNum(m: string): number {
  const [y, mo] = m.split('-').map(Number);
  return y * 12 + mo;
}

export default function HomeScreen() {
  const { state, selectedMonth, getPaymentsForInstallment, addPayment } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingInstallment, setEditingInstallment] = useState<Installment | null>(null);
  const [trackingInstallment, setTrackingInstallment] = useState<Installment | null>(null);
  const [expandedPersonId, setExpandedPersonId] = useState<string | null>(null);

  const summary = getOverallSummary(state.installments, state.billers, state.users, selectedMonth);
  const active = getActiveInstallments(state.installments, selectedMonth);
  const defaultUser = state.users.find(u => u.isDefault);
  const isCurrentMonth = selectedMonth === getCurrentMonth();

  // Due-date helpers
  const today = new Date();
  const currentDay = today.getDate();

  const getDueDayStatus = (dueDayOfMonth: number) => {
    if (!isCurrentMonth) return null;
    const diff = dueDayOfMonth - currentDay;
    if (diff < 0) return 'overdue';
    if (diff === 0) return 'today';
    if (diff <= 3) return 'soon';
    return null;
  };

  const getDueBadge = (dueDayOfMonth: number, billerIdOrInstallments?: string | Installment[]) => {
    const status = getDueDayStatus(dueDayOfMonth);
    if (!status) return null;

    // If a billerId is passed, check if ALL installments for that biller are paid
    if (typeof billerIdOrInstallments === 'string') {
      const billerInsts = active.filter(i => i.billerId === billerIdOrInstallments);
      const allPaid = billerInsts.every(i => getPaymentStatus(i).isPaid);
      if (allPaid) return null;
    }

    // If installments array is passed, check if all are paid
    if (Array.isArray(billerIdOrInstallments)) {
      const allPaid = billerIdOrInstallments.every(i => getPaymentStatus(i).isPaid);
      if (allPaid) return null;
    }

    switch (status) {
      case 'overdue':
        return { label: 'Overdue', color: Colors.danger, bg: Colors.dangerBg };
      case 'today':
        return { label: 'Due Today', color: Colors.warning, bg: Colors.warningBg };
      case 'soon':
        return { label: `Due in ${dueDayOfMonth - currentDay}d`, color: Colors.orange, bg: Colors.orangeBg };
      default:
        return null;
    }
  };

  // Payment status for a given installment in the selected month
  const getPaymentStatus = (inst: Installment) => {
    const payments = getPaymentsForInstallment(inst.id, selectedMonth);
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const remaining = inst.monthlyAmount - totalPaid;
    return { totalPaid, remaining: Math.max(remaining, 0), isPaid: remaining <= 0.005 };
  };

  // Owes summary: total unpaid from others this month
  const othersUnpaid = useMemo(() => {
    return active
      .filter(i => i.userId !== defaultUser?.id)
      .reduce((sum, i) => {
        const { remaining } = getPaymentStatus(i);
        return sum + remaining;
      }, 0);
  }, [active, defaultUser, selectedMonth, state.payments]);

  const othersPaid = useMemo(() => {
    return active
      .filter(i => i.userId !== defaultUser?.id)
      .reduce((sum, i) => {
        const { totalPaid } = getPaymentStatus(i);
        return sum + totalPaid;
      }, 0);
  }, [active, defaultUser, selectedMonth, state.payments]);

  const getPersonInstallments = (userId: string) =>
    active
      .filter(i => i.userId === userId)
      .map(i => ({
        ...i,
        billerName: state.billers.find(b => b.id === i.billerId)?.name || 'Unknown',
        dueDayOfMonth: state.billers.find(b => b.id === i.billerId)?.dueDayOfMonth || 1,
        monthNumber: monthToNum(selectedMonth) - monthToNum(i.startMonth) + 1,
      }));

  const handleInstallmentTap = (inst: Installment) => {
    // All installments open payment tracker
    setTrackingInstallment(inst);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Month label */}
        <Text style={styles.heading}>{formatMonth(selectedMonth)}</Text>

        {/* Total Due */}
        <View style={styles.card}>
          <View style={styles.totalCenter}>
            <Text style={styles.totalLabel}>TOTAL DUE</Text>
            <Text style={styles.totalValue}>{formatCurrency(summary.totalDue)}</Text>
          </View>
          <View style={styles.totalRow}>
            <View style={styles.totalHalf}>
              <Text style={styles.subLabel}>Mine</Text>
              <Text style={styles.mineValue}>{formatCurrency(summary.mine)}</Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.totalHalf}>
              <Text style={styles.subLabel}>Others</Text>
              <Text style={styles.othersValue}>{formatCurrency(summary.otherTotal)}</Text>
            </View>
          </View>
        </View>

        {/* Collection tracker */}
        {summary.otherTotal > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>COLLECTION TRACKER</Text>
            <View style={styles.collectionRow}>
              <View style={styles.collectionItem}>
                <View style={styles.collectionIconRow}>
                  <Ionicons name="wallet-outline" size={16} color={Colors.success} />
                  <Text style={styles.collectionLabel}>Collected</Text>
                </View>
                <Text style={[styles.collectionValue, { color: Colors.success }]}>
                  {formatCurrency(othersPaid)}
                </Text>
              </View>
              <View style={styles.collectionDivider} />
              <View style={styles.collectionItem}>
                <View style={styles.collectionIconRow}>
                  <Ionicons name="time-outline" size={16} color={Colors.warning} />
                  <Text style={styles.collectionLabel}>Uncollected</Text>
                </View>
                <Text style={[styles.collectionValue, { color: Colors.warning }]}>
                  {formatCurrency(othersUnpaid)}
                </Text>
              </View>
            </View>
            <View style={styles.progressBg}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: summary.otherTotal > 0
                      ? `${Math.min((othersPaid / summary.otherTotal) * 100, 100)}%`
                      : '0%',
                    backgroundColor: othersPaid >= summary.otherTotal ? Colors.success : Colors.accent,
                  },
                ]}
              />
            </View>
          </View>
        )}

        {/* By Platform */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>BY PLATFORM</Text>
          {summary.byPlatform.length > 0 ? (
            summary.byPlatform.map(({ biller, amount }) => {
              const badge = getDueBadge(biller.dueDayOfMonth, biller.id);
              return (
                <View key={biller.id} style={styles.listRow}>
                  <View style={styles.rowLeft}>
                    <Ionicons name="storefront-outline" size={16} color={Colors.textSecondary} />
                    <Text style={styles.listName}>{biller.name}</Text>
                    {badge && (
                      <View style={[styles.dueBadge, { backgroundColor: badge.bg }]}>
                        <Text style={[styles.dueBadgeText, { color: badge.color }]}>
                          {badge.label}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.rowRight}>
                    <Text style={styles.listAmount}>{formatCurrency(amount)}</Text>
                    {isCurrentMonth && (
                      <Text style={styles.dueDayText}>
                        {biller.dueDayOfMonth}{getOrdinalSuffix(biller.dueDayOfMonth)}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })
          ) : (
            <Text style={styles.emptyText}>No active installments this month</Text>
          )}
        </View>

        {/* By Person */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>BY PERSON</Text>
          {summary.byPerson.length > 0 ? (
            summary.byPerson.map(({ user, amount }) => {
              const isExpanded = expandedPersonId === user.id;
              const items = isExpanded ? getPersonInstallments(user.id) : [];
              const isOther = user.id !== defaultUser?.id;
              return (
                <View key={user.id}>
                  <Pressable
                    onPress={() => setExpandedPersonId(isExpanded ? null : user.id)}
                    style={styles.personRow}
                  >
                    <View style={styles.rowLeft}>
                      <Ionicons
                        name={isExpanded ? 'chevron-down' : 'chevron-forward'}
                        size={14}
                        color={Colors.textTertiary}
                      />
                      <Ionicons name="person-outline" size={16} color={Colors.textSecondary} />
                      <Text style={styles.listName}>{user.name}</Text>
                      {user.isDefault && <Text style={styles.meTag}>(me)</Text>}
                    </View>
                    <Text style={styles.listAmount}>{formatCurrency(amount)}</Text>
                  </Pressable>

                  {isExpanded && items.length > 0 && (
                    <View style={styles.itemizedList}>
                      {items.map(inst => {
                        const payStatus = getPaymentStatus(inst);
                        const badge = getDueBadge(inst.dueDayOfMonth, [inst]);
                        return (
                          <View key={inst.id} style={styles.itemizedWrapper}>
                            <Pressable
                              onPress={() => handleInstallmentTap(inst)}
                              style={({ pressed }) => [styles.itemizedRow, pressed && styles.itemizedRowPressed]}
                            >
                              <View style={styles.itemizedInfo}>
                                <View style={styles.itemDescRow}>
                                  <Text style={styles.itemizedDesc}>{inst.itemDescription}</Text>
                                  {badge && (
                                    <View style={[styles.miniDueBadge, { backgroundColor: badge.bg }]}>
                                      <Text style={[styles.miniDueBadgeText, { color: badge.color }]}>
                                        {badge.label}
                                      </Text>
                                    </View>
                                  )}
                                </View>
                                <Text style={styles.itemizedMeta}>
                                  {inst.billerName}  ·  {inst.monthNumber} of {inst.numberOfMonths} mo
                                </Text>
                                {!payStatus.isPaid && payStatus.totalPaid > 0 && (
                                  <View style={styles.payStatusRow}>
                                    <View style={styles.miniProgressBg}>
                                      <View
                                        style={[
                                          styles.miniProgressFill,
                                          {
                                            width: `${Math.min((payStatus.totalPaid / inst.monthlyAmount) * 100, 100)}%`,
                                          },
                                        ]}
                                      />
                                    </View>
                                    <Text style={styles.payStatusText}>
                                      {formatCurrency(payStatus.totalPaid)} / {formatCurrency(inst.monthlyAmount)}
                                    </Text>
                                  </View>
                                )}
                              </View>
                              <Text style={styles.itemizedAmount}>
                                {formatCurrency(inst.monthlyAmount)}
                              </Text>
                            </Pressable>
                            {/* Quick pay / paid badge */}
                            {payStatus.isPaid ? (
                              <View style={styles.paidBadge}>
                                <Ionicons name="checkmark-circle" size={13} color={Colors.success} />
                                <Text style={styles.paidBadgeText}>Paid</Text>
                              </View>
                            ) : (
                              <Pressable
                                onPress={() => {
                                  const rem = Math.round(payStatus.remaining * 100) / 100;
                                  addPayment(inst.id, selectedMonth, rem, 'Full payment');
                                }}
                                style={({ pressed }) => [styles.markPaidBtn, pressed && styles.markPaidBtnPressed]}
                              >
                                <Ionicons name="checkmark-done" size={13} color={Colors.success} />
                                <Text style={styles.markPaidText}>Mark Paid</Text>
                              </Pressable>
                            )}
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })
          ) : (
            <Text style={styles.emptyText}>No active installments this month</Text>
          )}
        </View>

        {/* Add New Installment */}
        <Pressable
          onPress={() => setShowModal(true)}
          style={({ pressed }) => [styles.addCard, pressed && styles.addCardPressed]}
        >
          <Ionicons name="add-circle-outline" size={22} color={Colors.accent} />
          <Text style={styles.addCardText}>Add New Installment</Text>
        </Pressable>
      </ScrollView>

      <AddInstallmentModal visible={showModal} onClose={() => setShowModal(false)} />
      <EditInstallmentModal
        visible={!!editingInstallment}
        installment={editingInstallment}
        onClose={() => setEditingInstallment(null)}
      />
      <PaymentTrackerModal
        visible={!!trackingInstallment}
        installment={trackingInstallment}
        month={selectedMonth}
        onClose={() => setTrackingInstallment(null)}
        onEdit={() => {
          const inst = trackingInstallment;
          setTrackingInstallment(null);
          setTimeout(() => setEditingInstallment(inst), 300);
        }}
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
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  totalCenter: {
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 1,
  },
  totalValue: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 32,
  },
  totalHalf: {
    alignItems: 'center',
  },
  separator: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  subLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  mineValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.accent,
    marginTop: 2,
  },
  othersValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.warning,
    marginTop: 2,
  },
  collectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceHover,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  collectionItem: {
    flex: 1,
    gap: 4,
  },
  collectionIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  collectionLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  collectionDivider: {
    width: 1,
    height: 36,
    backgroundColor: Colors.border,
    marginHorizontal: 14,
  },
  collectionValue: {
    fontSize: 17,
    fontWeight: '800',
    marginTop: 2,
  },
  progressBg: {
    height: 5,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 16,
  },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    flexWrap: 'wrap',
  },
  rowRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  listName: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  listAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  dueBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  dueBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  dueDayText: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  personRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    marginBottom: 4,
  },
  meTag: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  itemizedList: {
    marginLeft: 38,
    marginBottom: 12,
    borderLeftWidth: 2,
    borderLeftColor: Colors.border,
    paddingLeft: 12,
    gap: 6,
  },
  itemizedWrapper: {
    gap: 4,
  },
  itemizedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 4,
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  itemizedRowPressed: {
    backgroundColor: Colors.surfaceHover,
  },
  itemizedInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemDescRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  miniDueBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  miniDueBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  itemizedDesc: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  itemizedMeta: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  payStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  miniProgressBg: {
    height: 4,
    width: 40,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 2,
  },
  payStatusText: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  itemizedAmount: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: Colors.successBgLight,
    marginLeft: 4,
  },
  paidBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.success,
  },
  markPaidBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.success,
    marginLeft: 4,
  },
  markPaidBtnPressed: {
    backgroundColor: Colors.successBgLight,
  },
  markPaidText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.success,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textTertiary,
  },
  addCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  addCardPressed: {
    backgroundColor: Colors.surfaceHover,
  },
  addCardText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.accent,
  },
});
