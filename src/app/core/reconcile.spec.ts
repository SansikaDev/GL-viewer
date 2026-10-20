import { TestBed } from '@angular/core/testing';
import { ReconcileService } from './reconcile';
import type { Payment } from './models';
import { PaymentService } from './payments';

describe('ReconcileService.parseCsv', () => {
  let service: ReconcileService;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReconcileService);
  });

  it('reads amount and reference columns from a settlement file', () => {
    const rows = service.parseCsv(`settled_date,amount,reference,description,method,processor
2026-10-19,12.50,REF-1,Acme card,card,Stripe
2026-10-19,"1,250.00",WIRE-9,"Acme, Inc",wire,Fedwire
`);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      date: '2026-10-19',
      amount: 12.5,
      reference: 'REF-1',
      description: 'Acme card',
      method: 'card',
    });
    expect(rows[1].amount).toBe(1250);
    expect(rows[1].description).toBe('Acme, Inc');
  });

  it('rejects a file without the required columns', () => {
    expect(() => service.parseCsv('name,value\nfoo,1\n')).toThrow(/amount` and `reference/i);
  });

  it('rejects an empty report', () => {
    expect(() => service.parseCsv('amount,reference\n')).toThrow(/no data rows/i);
  });
});

describe('ReconcileService.run', () => {
  it('splits processor rows into matched, missing in app, and missing in report', () => {
    const posted = {
      id: 'pay_1',
      reference: 'REF-1',
      customer: 'Acme',
      method: 'card',
      status: 'settled',
      amount: 12.5,
      currency: 'USD',
      fee: 0.4,
      net: 12.1,
      glAccount: '1000',
      glAccountName: 'Cash',
      processor: 'Stripe',
      businessDate: '2026-10-19',
      createdAt: '2026-10-19T12:00:00.000Z',
      description: 'Invoice',
      ledger: [],
    } as Payment;

    const pending = {
      ...posted,
      id: 'pay_2',
      reference: 'REF-2',
      status: 'pending',
      amount: 40,
    } as Payment;

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: PaymentService,
          useValue: {
            forDay: () => [posted, pending],
          },
        },
      ],
    });

    const service = TestBed.inject(ReconcileService);
    const result = service.run(
      [
        {
          id: 'rpt_1',
          date: '2026-10-19',
          amount: 12.5,
          reference: 'ref-1',
          description: 'Acme',
          method: 'card',
          processor: 'Stripe',
        },
        {
          id: 'rpt_2',
          date: '2026-10-19',
          amount: 99,
          reference: 'BANK-FEE',
          description: 'Network fee',
          method: 'fee',
          processor: 'Stripe',
        },
      ],
      'stripe.csv',
      '2026-10-19',
    );

    expect(result.fileName).toBe('stripe.csv');
    expect(result.matched).toHaveLength(1);
    expect(result.matched[0].reason).toMatch(/reference/i);
    expect(result.missingInApp).toHaveLength(1);
    expect(result.missingInApp[0].report?.reference).toBe('BANK-FEE');
    expect(result.missingInReport).toHaveLength(1);
    expect(result.missingInReport[0].payment?.id).toBe('pay_2');
  });
});

describe('ReconcileService.readFile', () => {
  let service: ReconcileService;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReconcileService);
  });

  it('accepts a small CSV and rejects the wrong type or size', async () => {
    const csv = new File(['amount,reference\n1,R1\n'], 'report.csv', { type: 'text/csv' });
    await expect(service.readFile(csv)).resolves.toContain('amount,reference');

    const pdf = new File(['x'], 'report.pdf', { type: 'application/pdf' });
    await expect(service.readFile(pdf)).rejects.toThrow(/\.csv/);

    const huge = new File([new Uint8Array(2 * 1024 * 1024 + 1)], 'big.csv', { type: 'text/csv' });
    await expect(service.readFile(huge)).rejects.toThrow(/2 MB/);
  });
});
