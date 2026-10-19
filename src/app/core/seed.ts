import { shiftDay } from './format';
import type { LedgerLine, Payment, PaymentMethod, PaymentStatus } from './models';

interface SeedRow {
  id: string;
  reference: string;
  customer: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  feeRate: number;
  glAccount: string;
  glAccountName: string;
  processor: string;
  dayOffset: number;
  hour: number;
  minute: number;
  description: string;
  last4?: string;
  city?: string;
}

const ROWS: SeedRow[] = [
  {
    id: 'pay_nwl_card',
    reference: 'CHG-18420',
    customer: 'Northwind Labs',
    method: 'card',
    status: 'settled',
    amount: 18420,
    feeRate: 0.027,
    glAccount: '4000',
    glAccountName: 'Product revenue',
    processor: 'Stripe',
    dayOffset: 0,
    hour: 8,
    minute: 14,
    description: 'Annual platform renewal',
    last4: '4242',
    city: 'Austin',
  },
  {
    id: 'pay_harbor_ach',
    reference: 'ACH-22910',
    customer: 'Harbor & Pine',
    method: 'ach',
    status: 'settled',
    amount: 9600,
    feeRate: 0.008,
    glAccount: '4010',
    glAccountName: 'Services revenue',
    processor: 'Wells ACH',
    dayOffset: 0,
    hour: 8,
    minute: 41,
    description: 'Retainer - October',
    city: 'Portland',
  },
  {
    id: 'pay_atlas_wire',
    reference: 'WIRE-8841',
    customer: 'Atlas Freight Co',
    method: 'wire',
    status: 'settled',
    amount: 126400,
    feeRate: 0.001,
    glAccount: '4000',
    glAccountName: 'Product revenue',
    processor: 'Fedwire',
    dayOffset: 0,
    hour: 9,
    minute: 5,
    description: 'Fleet software settlement',
    city: 'Chicago',
  },
  {
    id: 'pay_sable_card',
    reference: 'CHG-18431',
    customer: 'Sable Media',
    method: 'card',
    status: 'settled',
    amount: 2480.5,
    feeRate: 0.029,
    glAccount: '4010',
    glAccountName: 'Services revenue',
    processor: 'Adyen',
    dayOffset: 0,
    hour: 9,
    minute: 22,
    description: 'Campaign seats × 12',
    last4: '1881',
    city: 'Brooklyn',
  },
  {
    id: 'pay_kestrel_rtp',
    reference: 'RTP-55102',
    customer: 'Kestrel Health',
    method: 'rtp',
    status: 'settled',
    amount: 17350,
    feeRate: 0.004,
    glAccount: '4000',
    glAccountName: 'Product revenue',
    processor: 'JPM Access',
    dayOffset: 0,
    hour: 9,
    minute: 58,
    description: 'Clinic rollout - wave 2',
    city: 'Denver',
  },
  {
    id: 'pay_orchard_card',
    reference: 'CHG-18444',
    customer: 'Orchard Supply',
    method: 'card',
    status: 'pending',
    amount: 890,
    feeRate: 0.027,
    glAccount: '2100',
    glAccountName: 'Unearned revenue',
    processor: 'Stripe',
    dayOffset: 0,
    hour: 10,
    minute: 11,
    description: 'POS hardware add-on',
    last4: '0015',
    city: 'Sacramento',
  },
  {
    id: 'pay_lumen_ach',
    reference: 'ACH-22944',
    customer: 'Lumen Legal',
    method: 'ach',
    status: 'failed',
    amount: 4200,
    feeRate: 0.008,
    glAccount: '1200',
    glAccountName: 'Accounts receivable',
    processor: 'Wells ACH',
    dayOffset: 0,
    hour: 10,
    minute: 36,
    description: 'Matter workspace - NSF',
    city: 'Boston',
  },
  {
    id: 'pay_bright_card',
    reference: 'CHG-18452',
    customer: 'Brightline Schools',
    method: 'card',
    status: 'settled',
    amount: 6120,
    feeRate: 0.022,
    glAccount: '4000',
    glAccountName: 'Product revenue',
    processor: 'Stripe',
    dayOffset: 0,
    hour: 11,
    minute: 4,
    description: 'District licenses',
    last4: '5510',
    city: 'Raleigh',
  },
  {
    id: 'pay_copper_check',
    reference: 'CHK-99204',
    customer: 'Copperfield Books',
    method: 'check',
    status: 'settled',
    amount: 1750,
    feeRate: 0,
    glAccount: '4010',
    glAccountName: 'Services revenue',
    processor: 'Checkscan',
    dayOffset: 0,
    hour: 11,
    minute: 27,
    description: 'Inventory module',
    city: 'Hudson',
  },
  {
    id: 'pay_vesper_wallet',
    reference: 'WAL-33018',
    customer: 'Vesper Hotels',
    method: 'wallet',
    status: 'settled',
    amount: 980,
    feeRate: 0.031,
    glAccount: '4000',
    glAccountName: 'Product revenue',
    processor: 'Adyen',
    dayOffset: 0,
    hour: 11,
    minute: 49,
    description: 'Guest folio add-on',
    city: 'Miami',
  },
  {
    id: 'pay_field_card',
    reference: 'CHG-18461',
    customer: 'Fieldnote Studio',
    method: 'card',
    status: 'settled',
    amount: 340,
    feeRate: 0.029,
    glAccount: '4010',
    glAccountName: 'Services revenue',
    processor: 'Stripe',
    dayOffset: 0,
    hour: 12,
    minute: 16,
    description: 'Pro seat upgrade',
    last4: '7774',
    city: 'Los Angeles',
  },
  {
    id: 'pay_redwood_ach',
    reference: 'ACH-22971',
    customer: 'Redwood Clinics',
    method: 'ach',
    status: 'settled',
    amount: 22140,
    feeRate: 0.008,
    glAccount: '4000',
    glAccountName: 'Product revenue',
    processor: 'Wells ACH',
    dayOffset: 0,
    hour: 12,
    minute: 48,
    description: 'EHR connector bundle',
    city: 'Seattle',
  },
  {
    id: 'pay_marlowe_card',
    reference: 'CHG-18470',
    customer: 'Marlowe Kitchen',
    method: 'card',
    status: 'reversed',
    amount: 1260,
    feeRate: 0.027,
    glAccount: '5200',
    glAccountName: 'Refunds & chargebacks',
    processor: 'Stripe',
    dayOffset: 0,
    hour: 13,
    minute: 9,
    description: 'Chargeback - duplicate ticket',
    last4: '3102',
    city: 'New Orleans',
  },
  {
    id: 'pay_circa_wire',
    reference: 'WIRE-8850',
    customer: 'Circa Apparel',
    method: 'wire',
    status: 'settled',
    amount: 44800,
    feeRate: 0.001,
    glAccount: '4000',
    glAccountName: 'Product revenue',
    processor: 'Fedwire',
    dayOffset: 0,
    hour: 13,
    minute: 33,
    description: 'Wholesale close',
    city: 'New York',
  },
  {
    id: 'pay_solstice_rtp',
    reference: 'RTP-55118',
    customer: 'Solstice Energy',
    method: 'rtp',
    status: 'settled',
    amount: 8900,
    feeRate: 0.004,
    glAccount: '4010',
    glAccountName: 'Services revenue',
    processor: 'JPM Access',
    dayOffset: 0,
    hour: 14,
    minute: 2,
    description: 'Field ops seats',
    city: 'Phoenix',
  },
  {
    id: 'pay_parallax_card',
    reference: 'CHG-18488',
    customer: 'Parallax Design',
    method: 'card',
    status: 'settled',
    amount: 1560,
    feeRate: 0.029,
    glAccount: '4010',
    glAccountName: 'Services revenue',
    processor: 'Adyen',
    dayOffset: 0,
    hour: 14,
    minute: 28,
    description: 'Studio plan',
    last4: '9090',
    city: 'Toronto',
  },
  {
    id: 'pay_ivy_ach',
    reference: 'ACH-22990',
    customer: 'Ivy & Oak',
    method: 'ach',
    status: 'pending',
    amount: 6750,
    feeRate: 0.008,
    glAccount: '1020',
    glAccountName: 'Processor clearing',
    processor: 'Wells ACH',
    dayOffset: 0,
    hour: 15,
    minute: 6,
    description: 'Seasonal catalog - in flight',
    city: 'Nashville',
  },
  {
    id: 'pay_halcyon_wallet',
    reference: 'WAL-33044',
    customer: 'Halcyon Bank Ops',
    method: 'wallet',
    status: 'settled',
    amount: 220,
    feeRate: 0.031,
    glAccount: '4010',
    glAccountName: 'Services revenue',
    processor: 'Stripe',
    dayOffset: 0,
    hour: 15,
    minute: 41,
    description: 'Sandbox overage',
    city: 'Charlotte',
  },
  {
    id: 'pay_grove_card',
    reference: 'CHG-18501',
    customer: 'Grove Analytics',
    method: 'card',
    status: 'settled',
    amount: 7340,
    feeRate: 0.027,
    glAccount: '4000',
    glAccountName: 'Product revenue',
    processor: 'Stripe',
    dayOffset: 0,
    hour: 16,
    minute: 12,
    description: 'Usage true-up',
    last4: '6621',
    city: 'Minneapolis',
  },
  {
    id: 'pay_quill_check',
    reference: 'CHK-99218',
    customer: 'Quill & Co.',
    method: 'check',
    status: 'pending',
    amount: 2400,
    feeRate: 0,
    glAccount: '1020',
    glAccountName: 'Processor clearing',
    processor: 'Checkscan',
    dayOffset: 0,
    hour: 16,
    minute: 37,
    description: 'Paper deposit - held',
    city: 'Providence',
  },
  {
    id: 'pay_nimbus_card',
    reference: 'CHG-18514',
    customer: 'Nimbus Freight',
    method: 'card',
    status: 'failed',
    amount: 499,
    feeRate: 0.029,
    glAccount: '1200',
    glAccountName: 'Accounts receivable',
    processor: 'Adyen',
    dayOffset: 0,
    hour: 17,
    minute: 3,
    description: 'Do not honor',
    last4: '1111',
    city: 'Dallas',
  },
  {
    id: 'pay_cedar_ach',
    reference: 'ACH-23002',
    customer: 'Cedar & Rye',
    method: 'ach',
    status: 'settled',
    amount: 3180,
    feeRate: 0.008,
    glAccount: '4010',
    glAccountName: 'Services revenue',
    processor: 'Wells ACH',
    dayOffset: 0,
    hour: 17,
    minute: 29,
    description: 'Tasting-room POS',
    city: 'Sonoma',
  },
  {
    id: 'pay_meridian_wire',
    reference: 'WIRE-8862',
    customer: 'Meridian Mutual',
    method: 'wire',
    status: 'settled',
    amount: 210000,
    feeRate: 0.0008,
    glAccount: '4000',
    glAccountName: 'Product revenue',
    processor: 'Fedwire',
    dayOffset: -1,
    hour: 10,
    minute: 12,
    description: 'Core conversion milestone',
    city: 'Hartford',
  },
  {
    id: 'pay_linen_card',
    reference: 'CHG-18302',
    customer: 'Linen Market',
    method: 'card',
    status: 'settled',
    amount: 910,
    feeRate: 0.027,
    glAccount: '4000',
    glAccountName: 'Product revenue',
    processor: 'Stripe',
    dayOffset: -1,
    hour: 13,
    minute: 44,
    description: 'Shop plan',
    last4: '8282',
    city: 'Boulder',
  },
  {
    id: 'pay_oak_ach',
    reference: 'ACH-22801',
    customer: 'Oak & Iron',
    method: 'ach',
    status: 'settled',
    amount: 15400,
    feeRate: 0.008,
    glAccount: '4010',
    glAccountName: 'Services revenue',
    processor: 'Wells ACH',
    dayOffset: -1,
    hour: 15,
    minute: 21,
    description: 'Implementation',
    city: 'Detroit',
  },
  {
    id: 'pay_pine_rtp',
    reference: 'RTP-54990',
    customer: 'Pine State Credit',
    method: 'rtp',
    status: 'failed',
    amount: 2500,
    feeRate: 0.004,
    glAccount: '1200',
    glAccountName: 'Accounts receivable',
    processor: 'JPM Access',
    dayOffset: -1,
    hour: 16,
    minute: 8,
    description: 'Beneficiary mismatch',
    city: 'Portland',
  },
  {
    id: 'pay_aster_card',
    reference: 'CHG-18110',
    customer: 'Aster Goods',
    method: 'card',
    status: 'settled',
    amount: 1280,
    feeRate: 0.029,
    glAccount: '4000',
    glAccountName: 'Product revenue',
    processor: 'Stripe',
    dayOffset: -3,
    hour: 11,
    minute: 3,
    description: 'Wholesale sample',
    last4: '4444',
    city: 'Philadelphia',
  },
];

function ledgerFor(row: SeedRow, amount: number, fee: number, net: number): LedgerLine[] {
  if (row.status === 'failed') {
    return [
      {
        account: '1200',
        name: 'Accounts receivable',
        debit: amount,
        credit: 0,
        memo: 'Capture failed - remains on AR until retried',
      },
    ];
  }

  if (row.status === 'pending') {
    return [
      {
        account: '1020',
        name: 'Processor clearing',
        debit: amount,
        credit: 0,
        memo: 'In flight - awaiting settlement file',
      },
      {
        account: '2100',
        name: 'Unearned revenue',
        debit: 0,
        credit: amount,
        memo: 'Not recognized until funds settle',
      },
    ];
  }

  if (row.status === 'reversed') {
    return [
      {
        account: '5200',
        name: 'Refunds & chargebacks',
        debit: amount,
        credit: 0,
        memo: row.description,
      },
      {
        account: '1020',
        name: 'Processor clearing',
        debit: 0,
        credit: amount,
        memo: 'Funds returned to cardholder',
      },
    ];
  }

  return [
    {
      account: '1020',
      name: 'Processor clearing',
      debit: net,
      credit: 0,
      memo: `Net from ${row.processor}`,
    },
    {
      account: '5100',
      name: 'Processing fees',
      debit: fee,
      credit: 0,
      memo: `${(row.feeRate * 100).toFixed(2)}% of ${row.reference}`,
    },
    {
      account: row.glAccount,
      name: row.glAccountName,
      debit: 0,
      credit: amount,
      memo: row.description,
    },
  ];
}

function stamp(day: string, hour: number, minute: number): string {
  const value = new Date(`${day}T00:00:00`);
  value.setHours(hour, minute, 0, 0);
  return `${day}T${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}:00`;
}

const HISTORY_CUSTOMERS = [
  'Northwind Labs',
  'Harbor & Pine',
  'Sable Media',
  'Orchard Supply',
  'Brightline Schools',
  'Fieldnote Studio',
  'Parallax Design',
  'Grove Analytics',
  'Cedar & Rye',
  'Linen Market',
  'Aster Goods',
  'Quill & Co.',
];
const HISTORY_METHODS: PaymentMethod[] = ['card', 'ach', 'wire', 'check', 'rtp', 'wallet'];
const METHOD_PROCESSOR: Record<PaymentMethod, string> = {
  card: 'Stripe',
  ach: 'Wells ACH',
  wire: 'Fedwire',
  check: 'Checkscan',
  rtp: 'JPM Access',
  wallet: 'Adyen',
};
const METHOD_PREFIX: Record<PaymentMethod, string> = {
  card: 'CHG',
  ach: 'ACH',
  wire: 'WIRE',
  check: 'CHK',
  rtp: 'RTP',
  wallet: 'WAL',
};

function rng(seed: number): () => number {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function historyRows(): SeedRow[] {
  const rows: SeedRow[] = [];
  for (let offset = -1; offset >= -109; offset -= 1) {
    const random = rng(2_026_1019 + offset * 97);
    const probe = new Date();
    probe.setHours(12, 0, 0, 0);
    probe.setDate(probe.getDate() + offset);
    const weekend = probe.getDay() === 0 || probe.getDay() === 6;
    const count = weekend ? 1 + Math.floor(random() * 2) : 3 + Math.floor(random() * 4);
    for (let index = 0; index < count; index += 1) {
      const method = HISTORY_METHODS[Math.floor(random() * HISTORY_METHODS.length)];
      const roll = random();
      const status: PaymentStatus = roll > 0.9 ? 'failed' : roll > 0.82 ? 'pending' : 'settled';
      const base = method === 'wire' ? 18000 : method === 'ach' ? 4200 : method === 'check' ? 900 : 640;
      rows.push({
        id: `pay_h_${Math.abs(offset)}_${index}`,
        reference: `${METHOD_PREFIX[method]}-${20000 + Math.abs(offset) * 12 + index}`,
        customer: HISTORY_CUSTOMERS[Math.floor(random() * HISTORY_CUSTOMERS.length)],
        method,
        status,
        amount: Math.round((base + random() * base * 2.5) * 100) / 100,
        feeRate: method === 'wire' ? 0.001 : method === 'ach' ? 0.008 : 0.027,
        glAccount: method === 'wire' || method === 'ach' ? '4000' : '4010',
        glAccountName: method === 'wire' || method === 'ach' ? 'Product revenue' : 'Services revenue',
        processor: METHOD_PROCESSOR[method],
        dayOffset: offset,
        hour: 8 + Math.floor(random() * 10),
        minute: Math.floor(random() * 56),
        description: 'Recurring settlement',
        city: 'Remote',
      });
    }
  }
  return rows;
}

function toPayment(row: SeedRow): Payment {
  const businessDate = shiftDay(row.dayOffset);
  const amount = Math.round(row.amount * 100) / 100;
  const fee = Math.round(amount * row.feeRate * 100) / 100;
  const net = Math.round((amount - fee) * 100) / 100;
  const createdAt = stamp(businessDate, row.hour, row.minute);
  return {
    id: row.id,
    reference: row.reference,
    customer: row.customer,
    method: row.method,
    status: row.status,
    amount,
    currency: 'USD',
    fee: row.status === 'failed' ? 0 : fee,
    net: row.status === 'failed' ? 0 : net,
    glAccount: row.glAccount,
    glAccountName: row.glAccountName,
    processor: row.processor,
    businessDate,
    createdAt,
    settledAt: row.status === 'settled' ? stamp(businessDate, row.hour, row.minute + 12) : undefined,
    description: row.description,
    last4: row.last4,
    city: row.city,
    ledger: ledgerFor(row, amount, fee, net),
  };
}

export function createLedger(): Payment[] {
  return [...ROWS, ...historyRows()].map(toPayment);
}

export const SAMPLE_OMIT_IDS = new Set(['pay_orchard_card', 'pay_halcyon_wallet', 'pay_quill_check']);
