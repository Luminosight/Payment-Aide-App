import React, { createContext, useContext, useReducer, useEffect, useCallback, useState, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Biller, BillerCategory, User, Installment, Payment, Toast } from '../types';
import { generateId, getCurrentMonth } from '../utils/formatters';
import { migrateData, validateAppState, serializeState } from '../utils/migrations';

// ── Seed Data ──────────────────────────────────────────────────

const SEED_STATE: AppState = {
  billers: [],
  users: [{ id: 'user-me', name: 'My Bill', isDefault: true }],
  installments: [],
  payments: [],
};

// ── Reducer ────────────────────────────────────────────────────

type Action =
  | { type: 'SET_STATE'; payload: AppState }
  | { type: 'ADD_BILLER'; payload: Biller }
  | { type: 'UPDATE_BILLER'; payload: Biller }
  | { type: 'DELETE_BILLER'; payload: string }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'ADD_INSTALLMENT'; payload: Installment }
  | { type: 'UPDATE_INSTALLMENT'; payload: Installment }
  | { type: 'DELETE_INSTALLMENT'; payload: string }
  | { type: 'ADD_PAYMENT'; payload: Payment }
  | { type: 'DELETE_PAYMENT'; payload: string }
  | { type: 'CLEAR_PAYMENTS_FOR_INSTALLMENT'; payload: { installmentId: string; month: string } }
  | { type: 'MERGE_IMPORT'; payload: { users: User[]; billers: Biller[]; installments: Installment[] } };

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_STATE':
      return action.payload;
    case 'ADD_BILLER':
      return { ...state, billers: [...state.billers, action.payload] };
    case 'UPDATE_BILLER':
      return { ...state, billers: state.billers.map(b => b.id === action.payload.id ? action.payload : b) };
    case 'DELETE_BILLER': {
      const removedInstIds = new Set(state.installments.filter(i => i.billerId === action.payload).map(i => i.id));
      return {
        ...state,
        billers: state.billers.filter(b => b.id !== action.payload),
        installments: state.installments.filter(i => i.billerId !== action.payload),
        payments: state.payments.filter(p => !removedInstIds.has(p.installmentId)),
      };
    }
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] };
    case 'UPDATE_USER':
      return { ...state, users: state.users.map(u => u.id === action.payload.id ? action.payload : u) };
    case 'DELETE_USER': {
      const removedInstIds = new Set(state.installments.filter(i => i.userId === action.payload).map(i => i.id));
      return {
        ...state,
        users: state.users.filter(u => u.id !== action.payload),
        installments: state.installments.filter(i => i.userId !== action.payload),
        payments: state.payments.filter(p => !removedInstIds.has(p.installmentId)),
      };
    }
    case 'ADD_INSTALLMENT':
      return { ...state, installments: [...state.installments, action.payload] };
    case 'UPDATE_INSTALLMENT':
      return { ...state, installments: state.installments.map(i => i.id === action.payload.id ? action.payload : i) };
    case 'DELETE_INSTALLMENT':
      return {
        ...state,
        installments: state.installments.filter(i => i.id !== action.payload),
        payments: state.payments.filter(p => p.installmentId !== action.payload),
      };
    case 'ADD_PAYMENT':
      return { ...state, payments: [...state.payments, action.payload] };
    case 'DELETE_PAYMENT':
      return { ...state, payments: state.payments.filter(p => p.id !== action.payload) };
    case 'CLEAR_PAYMENTS_FOR_INSTALLMENT':
      return {
        ...state,
        payments: state.payments.filter(
          p => !(p.installmentId === action.payload.installmentId && p.month === action.payload.month),
        ),
      };
    case 'MERGE_IMPORT': {
      // Merge imported data, skipping duplicates by id
      const existingUserIds = new Set(state.users.map(u => u.id));
      const existingBillerIds = new Set(state.billers.map(b => b.id));
      const existingInstIds = new Set(state.installments.map(i => i.id));
      return {
        ...state,
        users: [...state.users, ...action.payload.users.filter(u => !existingUserIds.has(u.id))],
        billers: [...state.billers, ...action.payload.billers.filter(b => !existingBillerIds.has(b.id))],
        installments: [...state.installments, ...action.payload.installments.filter(i => !existingInstIds.has(i.id))],
        payments: state.payments,
      };
    }
    default:
      return state;
  }
}

// ── Context ────────────────────────────────────────────────────

interface AppContextType {
  state: AppState;
  isLoaded: boolean;
  addBiller: (name: string, dueDayOfMonth: number, icon?: string, id?: string, category?: BillerCategory) => void;
  updateBiller: (biller: Biller) => void;
  deleteBiller: (id: string) => void;
  addUser: (name: string) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;
  addInstallment: (data: Omit<Installment, 'id' | 'monthlyAmount' | 'createdAt'>) => void;
  updateInstallment: (installment: Installment) => void;
  deleteInstallment: (id: string) => void;
  addPayment: (installmentId: string, month: string, amount: number, note?: string) => void;
  deletePayment: (id: string) => void;
  clearPaymentsForInstallment: (installmentId: string, month: string) => void;
  getPaymentsForInstallment: (installmentId: string, month: string) => Payment[];
  /** Merge imported spreadsheet data into current state */
  mergeImport: (imported: { users: User[]; billers: Biller[]; installments: Installment[] }) => void;
  replaceImport: (imported: AppState) => void;
  clearData: () => void;
  toasts: Toast[];
  addToast: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'payment-aide-data';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, SEED_STATE);
  const [isLoaded, setIsLoaded] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const skipNextSync = useRef(false);

  // Load saved data from AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          const migrated = migrateData(parsed);
          const validated = validateAppState(migrated);
          if (validated) {
            skipNextSync.current = true;
            dispatch({ type: 'SET_STATE', payload: validated });
          } else {
            console.warn('Stored data failed validation, using seed data');
          }
        }
      } catch (e) {
        console.warn('Failed to load data:', e);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  // Persist on every state change (after initial load)
  useEffect(() => {
    if (!isLoaded) return;

    // Skip the sync triggered by SET_STATE load
    if (skipNextSync.current) {
      skipNextSync.current = false;
      return;
    }

    AsyncStorage.setItem(STORAGE_KEY, serializeState(state)).catch(e =>
      console.warn('Failed to save to AsyncStorage:', e),
    );
  }, [state, isLoaded]);

  const addToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = generateId();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addBiller = useCallback((name: string, dueDayOfMonth: number, icon?: string, id?: string, category?: BillerCategory) => {
    dispatch({ type: 'ADD_BILLER', payload: { id: id || generateId(), name, dueDayOfMonth, icon, category } });
    addToast(`${name} added as biller`);
  }, [addToast]);

  const updateBiller = useCallback((biller: Biller) => {
    dispatch({ type: 'UPDATE_BILLER', payload: biller });
    addToast(`${biller.name} updated`);
  }, [addToast]);

  const deleteBiller = useCallback((id: string) => {
    const biller = state.billers.find(b => b.id === id);
    dispatch({ type: 'DELETE_BILLER', payload: id });
    addToast(`${biller?.name || 'Biller'} deleted`);
  }, [state.billers, addToast]);

  const addUser = useCallback((name: string) => {
    dispatch({ type: 'ADD_USER', payload: { id: generateId(), name, isDefault: false } });
    addToast(`${name} added`);
  }, [addToast]);

  const updateUser = useCallback((user: User) => {
    dispatch({ type: 'UPDATE_USER', payload: user });
    addToast(`${user.name} updated`);
  }, [addToast]);

  const deleteUser = useCallback((id: string) => {
    const user = state.users.find(u => u.id === id);
    dispatch({ type: 'DELETE_USER', payload: id });
    addToast(`${user?.name || 'User'} deleted`);
  }, [state.users, addToast]);

  const addInstallment = useCallback((data: Omit<Installment, 'id' | 'monthlyAmount' | 'createdAt'>) => {
    const monthlyAmount = Math.round((data.totalAmount / data.numberOfMonths) * 100) / 100;
    dispatch({
      type: 'ADD_INSTALLMENT',
      payload: {
        ...data,
        id: generateId(),
        monthlyAmount,
        createdAt: new Date().toISOString(),
      },
    });
    addToast('Installment added');
  }, [addToast]);

  const deleteInstallment = useCallback((id: string) => {
    dispatch({ type: 'DELETE_INSTALLMENT', payload: id });
    addToast('Installment deleted');
  }, [addToast]);

  const updateInstallment = useCallback((installment: Installment) => {
    dispatch({ type: 'UPDATE_INSTALLMENT', payload: installment });
    addToast('Installment updated');
  }, [addToast]);

  const mergeImport = useCallback((imported: { users: User[]; billers: Biller[]; installments: Installment[] }) => {
    dispatch({ type: 'MERGE_IMPORT', payload: imported });
  }, []);

  const replaceImport = useCallback((imported: AppState) => {
    dispatch({ type: 'SET_STATE', payload: imported });
  }, []);

  const clearData = useCallback(() => {
    dispatch({ type: 'SET_STATE', payload: { ...SEED_STATE } });
  }, []);

  const addPayment = useCallback((installmentId: string, month: string, amount: number, note?: string) => {
    dispatch({
      type: 'ADD_PAYMENT',
      payload: {
        id: generateId(),
        installmentId,
        month,
        amount,
        paidAt: new Date().toISOString(),
        note,
      },
    });
    addToast('Payment recorded');
  }, [addToast]);

  const deletePayment = useCallback((id: string) => {
    dispatch({ type: 'DELETE_PAYMENT', payload: id });
    addToast('Payment removed');
  }, [addToast]);

  const clearPaymentsForInstallment = useCallback((installmentId: string, month: string) => {
    dispatch({ type: 'CLEAR_PAYMENTS_FOR_INSTALLMENT', payload: { installmentId, month } });
    addToast('All payments cleared');
  }, [addToast]);

  const getPaymentsForInstallment = useCallback((installmentId: string, month: string) => {
    return state.payments.filter(p => p.installmentId === installmentId && p.month === month);
  }, [state.payments]);

  return (
    <AppContext.Provider value={{
      state, isLoaded,
      addBiller, updateBiller, deleteBiller,
      addUser, updateUser, deleteUser,
      addInstallment, updateInstallment, deleteInstallment,
      addPayment, deletePayment, clearPaymentsForInstallment, getPaymentsForInstallment,
      mergeImport, replaceImport, clearData,
      toasts, addToast, removeToast,
      selectedMonth, setSelectedMonth,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
