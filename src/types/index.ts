export type BillerCategory = 'E-commerce/BNPL' | 'Traditional Bank' | 'Digital Bank' | 'Utility' | 'Telco' | 'Subscriptions' | 'Government' | 'Other';

export interface Biller {
  id: string;
  name: string;
  dueDayOfMonth: number;
  category?: BillerCategory;
  icon?: string;
}

export interface User {
  id: string;
  name: string;
  isDefault: boolean;
}

export interface Installment {
  id: string;
  billerId: string;
  userId: string;
  itemDescription: string;
  totalAmount: number;
  monthlyAmount: number;
  numberOfMonths: number;
  startMonth: string; // "YYYY-MM"
  createdAt: string;  // ISO date
}

export interface Payment {
  id: string;
  installmentId: string;
  month: string;    // "YYYY-MM" – which month this payment covers
  amount: number;
  paidAt: string;   // ISO date
  note?: string;
}

export interface AppState {
  billers: Biller[];
  users: User[];
  installments: Installment[];
  payments: Payment[];
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

// Re-export calculation types for convenience
export interface BillerSummary {
  biller: Biller;
  total: number;
  mine: number;
  others: { user: User; amount: number }[];
  installments: Installment[];
}

export interface OverallSummary {
  totalDue: number;
  mine: number;
  otherTotal: number;
  byPlatform: { biller: Biller; amount: number }[];
  byPerson: { user: User; amount: number }[];
}
