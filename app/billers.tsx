import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../src/context/AppContext';
import { getOrdinalSuffix } from '../src/utils/formatters';
import { Colors } from '../src/constants/theme';
import {
  BILLER_CATALOG,
  BILLER_CATEGORIES,
  CATEGORY_ICONS,
  CatalogBiller,
} from '../src/constants/billers';
import ToastContainer from '../src/components/Toast';

export default function BillersScreen() {
  const { state, addBiller, updateBiller, deleteBiller, addToast } = useApp();

  // Which catalog biller is being added (pending due day input)
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addingDueDay, setAddingDueDay] = useState('');

  // Editing due day of an existing biller
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDueDay, setEditingDueDay] = useState('');

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Custom biller ("Other")
  const [customName, setCustomName] = useState('');
  const [customDueDay, setCustomDueDay] = useState('');

  // Collapsible categories
  const [collapsedCats, setCollapsedCats] = useState<Set<string>>(new Set());

  const toggleCategory = (cat: string) => {
    setCollapsedCats(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const isAdded = (catalogId: string) =>
    state.billers.some(b => b.id === catalogId);

  const getStateBiller = (catalogId: string) =>
    state.billers.find(b => b.id === catalogId);

  const handleAddFromCatalog = (item: CatalogBiller) => {
    const day = parseInt(addingDueDay);
    if (!day || day < 1 || day > 31) {
      addToast('Enter a valid due day (1-31)', 'error');
      return;
    }
    addBiller(item.name, day, undefined, item.id, item.category);
    setAddingId(null);
    setAddingDueDay('');
  };

  const handleUpdateDueDay = (id: string) => {
    const day = parseInt(editingDueDay);
    if (!day || day < 1 || day > 31) return;
    const biller = state.billers.find(b => b.id === id);
    if (!biller) return;
    updateBiller({ ...biller, dueDayOfMonth: day });
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    const hasInstallments = state.installments.some(i => i.billerId === id);
    if (hasInstallments && deleteConfirmId !== id) {
      setDeleteConfirmId(id);
      return;
    }
    deleteBiller(id);
    setDeleteConfirmId(null);
  };

  const handleAddCustom = () => {
    const trimmed = customName.trim();
    const day = parseInt(customDueDay);
    if (!trimmed) { addToast('Enter a biller name', 'error'); return; }
    if (!day || day < 1 || day > 31) { addToast('Enter a valid due day (1-31)', 'error'); return; }
    addBiller(trimmed, day, undefined, undefined, 'Other');
    setCustomName('');
    setCustomDueDay('');
  };

  // Get user's "Other" billers (custom ones not in catalog)
  const catalogIds = new Set(BILLER_CATALOG.map(b => b.id));
  const customBillers = state.billers.filter(b => !catalogIds.has(b.id));

  const renderCatalogItem = (item: CatalogBiller) => {
    const added = isAdded(item.id);
    const biller = getStateBiller(item.id);
    const isAdding = addingId === item.id;
    const isEditing = editingId === item.id;

    return (
      <View key={item.id} style={styles.billerRow}>
        <Image source={item.logo} style={styles.billerLogo} />
        <View style={styles.billerInfo}>
          <Text style={[styles.billerName, added && styles.billerNameActive]}>
            {item.name}
          </Text>
          {added && biller && !isEditing && (
            <Text style={styles.dueBadge}>
              Due: {biller.dueDayOfMonth}{getOrdinalSuffix(biller.dueDayOfMonth)}
            </Text>
          )}
        </View>

        {/* Actions */}
        {added && !isEditing ? (
          <View style={styles.rowActions}>
            <Pressable
              onPress={() => { setEditingId(item.id); setEditingDueDay(String(biller!.dueDayOfMonth)); }}
              style={styles.miniBtn}
            >
              <Ionicons name="pencil" size={14} color={Colors.textSecondary} />
            </Pressable>
            <Pressable onPress={() => handleDelete(item.id)} style={styles.miniBtn}>
              <Ionicons
                name="trash-outline"
                size={14}
                color={deleteConfirmId === item.id ? Colors.danger : Colors.textSecondary}
              />
            </Pressable>
          </View>
        ) : isEditing ? (
          <View style={styles.inlineEdit}>
            <TextInput
              value={editingDueDay}
              onChangeText={setEditingDueDay}
              keyboardType="number-pad"
              placeholder="Day"
              placeholderTextColor={Colors.textTertiary}
              style={styles.dayInputSmall}
              autoFocus
              onSubmitEditing={() => handleUpdateDueDay(item.id)}
            />
            <Pressable onPress={() => handleUpdateDueDay(item.id)} style={styles.miniBtn}>
              <Ionicons name="checkmark" size={16} color={Colors.success} />
            </Pressable>
            <Pressable onPress={() => setEditingId(null)} style={styles.miniBtn}>
              <Ionicons name="close" size={16} color={Colors.textSecondary} />
            </Pressable>
          </View>
        ) : isAdding ? (
          <View style={styles.inlineEdit}>
            <TextInput
              value={addingDueDay}
              onChangeText={setAddingDueDay}
              keyboardType="number-pad"
              placeholder="Due day"
              placeholderTextColor={Colors.textTertiary}
              style={styles.dayInputSmall}
              autoFocus
              onSubmitEditing={() => handleAddFromCatalog(item)}
            />
            <Pressable onPress={() => handleAddFromCatalog(item)} style={styles.miniBtn}>
              <Ionicons name="checkmark" size={16} color={Colors.success} />
            </Pressable>
            <Pressable onPress={() => { setAddingId(null); setAddingDueDay(''); }} style={styles.miniBtn}>
              <Ionicons name="close" size={16} color={Colors.textSecondary} />
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={() => { setAddingId(item.id); setAddingDueDay(''); }}
            style={styles.addChip}
          >
            <Ionicons name="add" size={14} color={Colors.accent} />
            <Text style={styles.addChipText}>Add</Text>
          </Pressable>
        )}

        {deleteConfirmId === item.id && !isEditing && (
          <Text style={styles.confirmText}>Has installments. Tap delete again to confirm.</Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Active billers count */}
        <View style={styles.summaryBar}>
          <Ionicons name="checkmark-circle" size={16} color={Colors.accent} />
          <Text style={styles.summaryText}>
            {state.billers.length} biller{state.billers.length !== 1 ? 's' : ''} added
          </Text>
        </View>

        {/* Catalog by category */}
        {BILLER_CATEGORIES.map(cat => {
          const items = BILLER_CATALOG.filter(b => b.category === cat);
          const addedCount = items.filter(b => isAdded(b.id)).length;
          const isCollapsed = collapsedCats.has(cat);
          const iconName = CATEGORY_ICONS[cat] || 'ellipsis-horizontal-circle-outline';

          return (
            <View key={cat} style={styles.categoryCard}>
              <Pressable onPress={() => toggleCategory(cat)} style={styles.categoryHeader}>
                <View style={styles.categoryLeft}>
                  <Ionicons name={iconName as any} size={18} color={Colors.textSecondary} />
                  <Text style={styles.categoryTitle}>{cat}</Text>
                </View>
                <View style={styles.categoryRight}>
                  {addedCount > 0 && (
                    <View style={styles.countBadge}>
                      <Text style={styles.countBadgeText}>{addedCount}</Text>
                    </View>
                  )}
                  <Ionicons
                    name={isCollapsed ? 'chevron-forward' : 'chevron-down'}
                    size={16}
                    color={Colors.textTertiary}
                  />
                </View>
              </Pressable>
              {!isCollapsed && (
                <View style={styles.categoryBody}>
                  {items.map(renderCatalogItem)}
                </View>
              )}
            </View>
          );
        })}

        {/* Other / Custom billers */}
        <View style={styles.categoryCard}>
          <View style={styles.categoryHeader}>
            <View style={styles.categoryLeft}>
              <Ionicons name="ellipsis-horizontal-circle-outline" size={18} color={Colors.textSecondary} />
              <Text style={styles.categoryTitle}>Other Billers</Text>
            </View>
            {customBillers.length > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{customBillers.length}</Text>
              </View>
            )}
          </View>
          <View style={styles.categoryBody}>
            {customBillers.map(biller => (
              <View key={biller.id} style={styles.billerRow}>
                <View style={styles.billerInfo}>
                  <Text style={[styles.billerName, styles.billerNameActive]}>{biller.name}</Text>
                  {editingId !== biller.id && (
                    <Text style={styles.dueBadge}>
                      Due: {biller.dueDayOfMonth}{getOrdinalSuffix(biller.dueDayOfMonth)}
                    </Text>
                  )}
                </View>
                {editingId === biller.id ? (
                  <View style={styles.inlineEdit}>
                    <TextInput
                      value={editingDueDay}
                      onChangeText={setEditingDueDay}
                      keyboardType="number-pad"
                      placeholder="Day"
                      placeholderTextColor={Colors.textTertiary}
                      style={styles.dayInputSmall}
                      autoFocus
                      onSubmitEditing={() => handleUpdateDueDay(biller.id)}
                    />
                    <Pressable onPress={() => handleUpdateDueDay(biller.id)} style={styles.miniBtn}>
                      <Ionicons name="checkmark" size={16} color={Colors.success} />
                    </Pressable>
                    <Pressable onPress={() => setEditingId(null)} style={styles.miniBtn}>
                      <Ionicons name="close" size={16} color={Colors.textSecondary} />
                    </Pressable>
                  </View>
                ) : (
                  <View style={styles.rowActions}>
                    <Pressable
                      onPress={() => { setEditingId(biller.id); setEditingDueDay(String(biller.dueDayOfMonth)); }}
                      style={styles.miniBtn}
                    >
                      <Ionicons name="pencil" size={14} color={Colors.textSecondary} />
                    </Pressable>
                    <Pressable onPress={() => handleDelete(biller.id)} style={styles.miniBtn}>
                      <Ionicons
                        name="trash-outline"
                        size={14}
                        color={deleteConfirmId === biller.id ? Colors.danger : Colors.textSecondary}
                      />
                    </Pressable>
                  </View>
                )}
                {deleteConfirmId === biller.id && editingId !== biller.id && (
                  <Text style={styles.confirmText}>Has installments. Tap delete again to confirm.</Text>
                )}
              </View>
            ))}

            {/* Add custom biller form */}
            <View style={styles.customAddRow}>
              <TextInput
                value={customName}
                onChangeText={setCustomName}
                placeholder="Custom biller name..."
                placeholderTextColor={Colors.textTertiary}
                style={styles.customNameInput}
              />
              <TextInput
                value={customDueDay}
                onChangeText={setCustomDueDay}
                placeholder="Day"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="number-pad"
                style={styles.dayInputSmall}
              />
              <Pressable
                onPress={handleAddCustom}
                style={({ pressed }) => [styles.addCustomBtn, pressed && styles.addCustomBtnPressed]}
              >
                <Ionicons name="add" size={16} color={Colors.white} />
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
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
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  categoryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    letterSpacing: 0.2,
  },
  countBadge: {
    backgroundColor: Colors.accent,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.white,
  },
  categoryBody: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  billerRow: {
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderSubtle,
  },
  billerLogo: {
    width: 24,
    height: 24,
    borderRadius: 6,
    marginRight: 10,
    backgroundColor: Colors.inputBg,
  },
  billerInfo: {
    flex: 1,
    marginRight: 8,
  },
  billerName: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '400',
  },
  billerNameActive: {
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  dueBadge: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  rowActions: {
    flexDirection: 'row',
    gap: 2,
  },
  miniBtn: {
    padding: 6,
    borderRadius: 6,
  },
  inlineEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dayInputSmall: {
    width: 52,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.inputBg,
    textAlign: 'center',
    fontSize: 13,
    color: Colors.textPrimary,
  },
  addChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  addChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.accent,
  },
  confirmText: {
    fontSize: 11,
    color: Colors.danger,
    width: '100%',
    marginTop: 4,
  },
  customAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 10,
    paddingBottom: 4,
  },
  customNameInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.inputBg,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  addCustomBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 8,
    padding: 8,
  },
  addCustomBtnPressed: {
    backgroundColor: Colors.accentHover,
  },
});
