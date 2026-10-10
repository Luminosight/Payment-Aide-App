import { Installment, Biller, User } from '../types';

function monthToNumber(monthStr: string): number {
  const [year, month] = monthStr.split('-').map(Number);
  return year * 12 + month;
}

export function isInstallmentActive(installment: Installment, targetMonth: string): boolean {
  const start = monthToNumber(installment.startMonth);
  const target = monthToNumber(targetMonth);
  const end = start + installment.numberOfMonths;
  return target >= start && target < end;
}

export function getActiveInstallments(installments: Installment[], targetMonth: string): Installment[] {
  return installments.filter(i => isInstallmentActive(i, targetMonth));
}

export interface BillerSummary {
  biller: Biller;
  total: number;
  mine: number;
  others: { user: User; amount: number }[];
  installments: Installment[];
}

export function aggregateByBiller(
  installments: Installment[],
  billers: Biller[],
  users: User[],
  targetMonth: string,
): BillerSummary[] {
  const active = getActiveInstallments(installments, targetMonth);
  const defaultUser = users.find(u => u.isDefault);

  return billers
    .map(biller => {
      const billerInstallments = active.filter(i => i.billerId === biller.id);
      const total = billerInstallments.reduce((sum, i) => sum + i.monthlyAmount, 0);
      const mine = billerInstallments
        .filter(i => i.userId === defaultUser?.id)
        .reduce((sum, i) => sum + i.monthlyAmount, 0);

      const othersMap = new Map<string, number>();
      billerInstallments
        .filter(i => i.userId !== defaultUser?.id)
        .forEach(i => {
          othersMap.set(i.userId, (othersMap.get(i.userId) || 0) + i.monthlyAmount);
        });

      const others = Array.from(othersMap.entries())
        .map(([userId, amount]) => ({
          user: users.find(u => u.id === userId) || { id: userId, name: 'Unknown', isDefault: false },
          amount,
        }))
        .sort((a, b) => b.amount - a.amount);

      return { biller, total, mine, others, installments: billerInstallments };
    })
    .filter(s => s.total > 0);
}

export interface OverallSummary {
  totalDue: number;
  mine: number;
  otherTotal: number;
  byPlatform: { biller: Biller; amount: number }[];
  byPerson: { user: User; amount: number }[];
}

export function getOverallSummary(
  installments: Installment[],
  billers: Biller[],
  users: User[],
  targetMonth: string,
): OverallSummary {
  const active = getActiveInstallments(installments, targetMonth);
  const defaultUser = users.find(u => u.isDefault);

  const totalDue = active.reduce((sum, i) => sum + i.monthlyAmount, 0);
  const mine = active
    .filter(i => i.userId === defaultUser?.id)
    .reduce((sum, i) => sum + i.monthlyAmount, 0);

  const platformMap = new Map<string, number>();
  active.forEach(i => {
    platformMap.set(i.billerId, (platformMap.get(i.billerId) || 0) + i.monthlyAmount);
  });
  const byPlatform = Array.from(platformMap.entries())
    .map(([billerId, amount]) => ({
      biller: billers.find(b => b.id === billerId) || { id: billerId, name: 'Unknown', dueDayOfMonth: 1 },
      amount,
    }))
    .sort((a, b) => b.amount - a.amount);

  const personMap = new Map<string, number>();
  active.forEach(i => {
    personMap.set(i.userId, (personMap.get(i.userId) || 0) + i.monthlyAmount);
  });
  const byPerson = Array.from(personMap.entries())
    .map(([userId, amount]) => ({
      user: users.find(u => u.id === userId) || { id: userId, name: 'Unknown', isDefault: false },
      amount,
    }))
    .sort((a, b) => {
      // Pin default user (My Bill) at the top
      if (a.user.isDefault) return -1;
      if (b.user.isDefault) return 1;
      return b.amount - a.amount;
    });

  return { totalDue, mine, otherTotal: totalDue - mine, byPlatform, byPerson };
}
