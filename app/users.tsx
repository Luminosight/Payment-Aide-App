import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../src/context/AppContext';
import { Colors } from '../src/constants/theme';
import ToastContainer from '../src/components/Toast';

export default function UsersScreen() {
  const { state, addUser, updateUser, deleteUser, addToast } = useApp();
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed) { addToast('Enter a name', 'error'); return; }
    if (state.users.some(u => u.name.toLowerCase() === trimmed.toLowerCase())) {
      addToast('User already exists', 'error');
      return;
    }
    addUser(trimmed);
    setNewName('');
  };

  const handleUpdate = (id: string) => {
    const trimmed = editingName.trim();
    if (!trimmed) return;
    const user = state.users.find(u => u.id === id);
    if (!user) return;
    updateUser({ ...user, name: trimmed });
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    const hasInstallments = state.installments.some(i => i.userId === id);
    if (hasInstallments && deleteConfirmId !== id) {
      setDeleteConfirmId(id);
      return;
    }
    deleteUser(id);
    setDeleteConfirmId(null);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 16 }}>
        {[...state.users].sort((a, b) => {
          if (a.isDefault) return -1;
          if (b.isDefault) return 1;
          return 0;
        }).map(user => (
          <View key={user.id} style={styles.card}>
            <Ionicons name="person-circle-outline" size={24} color={Colors.textSecondary} />

            {editingId === user.id ? (
              <View style={styles.editRow}>
                <TextInput
                  value={editingName}
                  onChangeText={setEditingName}
                  style={styles.editInput}
                  autoFocus
                  onSubmitEditing={() => handleUpdate(user.id)}
                />
                <Pressable onPress={() => handleUpdate(user.id)} style={styles.iconBtn}>
                  <Ionicons name="checkmark" size={18} color={Colors.success} />
                </Pressable>
                <Pressable onPress={() => setEditingId(null)} style={styles.iconBtn}>
                  <Ionicons name="close" size={18} color={Colors.textSecondary} />
                </Pressable>
              </View>
            ) : (
              <View style={styles.infoRow}>
                <View style={styles.nameContainer}>
                  <Text style={styles.userName}>{user.name}</Text>
                  {user.isDefault && <Text style={styles.defaultTag}>(default)</Text>}
                </View>
                <View style={styles.actions}>
                  {user.isDefault ? (
                    <Ionicons name="lock-closed" size={16} color={Colors.border} />
                  ) : (
                    <>
                      <Pressable
                        onPress={() => { setEditingId(user.id); setEditingName(user.name); }}
                        style={styles.iconBtn}
                      >
                        <Ionicons name="pencil" size={16} color={Colors.textSecondary} />
                      </Pressable>
                      <Pressable
                        onPress={() => handleDelete(user.id)}
                        style={styles.iconBtn}
                      >
                        <Ionicons
                          name="trash"
                          size={16}
                          color={deleteConfirmId === user.id ? Colors.danger : Colors.textSecondary}
                        />
                      </Pressable>
                    </>
                  )}
                </View>
              </View>
            )}

            {deleteConfirmId === user.id && editingId !== user.id && (
              <Text style={styles.confirmText}>Tap delete again to confirm</Text>
            )}
          </View>
        ))}

        {/* Add user */}
        <View style={styles.addCard}>
          <TextInput
            value={newName}
            onChangeText={setNewName}
            placeholder="New user name..."
            placeholderTextColor={Colors.textTertiary}
            style={styles.addInput}
            onSubmitEditing={handleAdd}
          />
          <Pressable
            onPress={handleAdd}
            style={({ pressed }) => [styles.addBtn, pressed && styles.addBtnPressed]}
          >
            <Ionicons name="add" size={16} color={Colors.white} />
            <Text style={styles.addBtnText}>Add</Text>
          </Pressable>
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
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    flexWrap: 'wrap',
  },

  editRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.inputBg,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  infoRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  defaultTag: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 8,
  },
  confirmText: {
    fontSize: 12,
    color: Colors.danger,
    width: '100%',
    marginTop: 4,
  },
  addCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  addInput: {
    flex: 1,
    backgroundColor: Colors.inputBg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  addBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addBtnPressed: {
    backgroundColor: Colors.accentHover,
  },
  addBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
});
