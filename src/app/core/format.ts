import type { PaymentMethod, PaymentStatus } from './models';

export function toDayKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function shiftDay(offset: number, from = new Date()): string {
  const next = new Date(from);
  next.setHours(12, 0, 0, 0);
  next.setDate(next.getDate() + offset);
  return toDayKey(next);
}

export function money(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function compactMoney(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: value >= 10_000 ? 'compact' : 'standard',
    maximumFractionDigits: value >= 10_000 ? 1 : 2,
  }).format(value);
}

export function formatDay(day: string): string {
  const [year, month, date] = day.split('-').map(Number);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(year, month - 1, date));
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function formatShortDay(day: string): string {
  const [year, month, date] = day.split('-').map(Number);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(year, month - 1, date));
}

export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) {
    return current === 0 ? 0 : null;
  }
  return ((current - previous) / previous) * 100;
}

export function formatStamp(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));
}

export const METHOD_COPY: Record<
  PaymentMethod,
  { label: string; description: string; icon: string }
> = {
  card: {
    label: 'Card',
    description: 'Visa, Mastercard, Amex',
    icon: 'lucideCreditCard',
  },
  ach: {
    label: 'ACH',
    description: 'Bank pulls and credits',
    icon: 'lucideBuilding2',
  },
  wire: {
    label: 'Wire',
    description: 'Same-day bank wires',
    icon: 'lucideLandmark',
  },
  check: {
    label: 'Check',
    description: 'Scanned paper deposits',
    icon: 'lucideBanknote',
  },
  rtp: {
    label: 'RTP',
    description: 'FedNow / real-time rails',
    icon: 'lucideZap',
  },
  wallet: {
    label: 'Wallet',
    description: 'Apple Pay, PayPal, Link',
    icon: 'lucideWallet',
  },
};

export const STATUS_COPY: Record<
  PaymentStatus,
  { label: string; tone: 'success' | 'warning' | 'danger' | 'neutral' }
> = {
  settled: { label: 'Settled', tone: 'success' },
  pending: { label: 'Pending', tone: 'warning' },
  failed: { label: 'Failed', tone: 'danger' },
  reversed: { label: 'Reversed', tone: 'neutral' },
};
