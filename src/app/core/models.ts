export type PaymentMethod = 'card' | 'ach' | 'wire' | 'check' | 'rtp' | 'wallet';
export type PaymentStatus = 'settled' | 'pending' | 'failed' | 'reversed';

export interface LedgerLine {
  account: string;
  name: string;
  debit: number;
  credit: number;
  memo: string;
}

export interface Payment {
  id: string;
  reference: string;
  customer: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  currency: 'USD';
  fee: number;
  net: number;
  glAccount: string;
  glAccountName: string;
  processor: string;
  businessDate: string;
  createdAt: string;
  settledAt?: string;
  description: string;
  last4?: string;
  city?: string;
  ledger: LedgerLine[];
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  expiresAt: number;
}

export interface MethodMix {
  method: PaymentMethod;
  label: string;
  description: string;
  icon: string;
  count: number;
  volume: number;
  settled: number;
  failed: number;
  pending: number;
  share: number;
}

export type DateRange = '1d' | '7d' | '30d' | '90d' | 'all';

export interface SeriesPoint {
  date: string;
  label: string;
  volume: number;
  count: number;
}

export interface PeriodDelta {
  volume: number | null;
  count: number | null;
  net: number | null;
  exceptions: number | null;
}

export interface DaySnapshot {
  date: string;
  from: string;
  to: string;
  range: DateRange;
  label: string;
  count: number;
  volume: number;
  net: number;
  fees: number;
  settledCount: number;
  pendingCount: number;
  failedCount: number;
  reversedCount: number;
  mix: MethodMix[];
  hourly: { hour: number; volume: number; count: number }[];
  series: SeriesPoint[];
  delta: PeriodDelta;
}

export interface ReportRow {
  id: string;
  date: string;
  amount: number;
  reference: string;
  description: string;
  method: string;
  processor: string;
}

export type MatchKind = 'matched' | 'missing-in-app' | 'missing-in-report';

export interface ReconcileMatch {
  kind: MatchKind;
  report?: ReportRow;
  payment?: Payment;
  reason: string;
}

export interface ReconcileResult {
  fileName: string;
  generatedAt: string;
  reportCount: number;
  appCount: number;
  matched: ReconcileMatch[];
  missingInApp: ReconcileMatch[];
  missingInReport: ReconcileMatch[];
}
