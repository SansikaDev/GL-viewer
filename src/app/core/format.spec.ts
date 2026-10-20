import { money, percentChange, shiftDay, toDayKey } from './format';

describe('toDayKey', () => {
  it('formats a local calendar date as YYYY-MM-DD', () => {
    expect(toDayKey(new Date(2026, 9, 19))).toBe('2026-10-19');
  });
});

describe('shiftDay', () => {
  it('moves forward and backward by whole days', () => {
    const from = new Date(2026, 9, 19);
    expect(shiftDay(1, from)).toBe('2026-10-20');
    expect(shiftDay(-1, from)).toBe('2026-10-18');
  });
});

describe('money', () => {
  it('formats USD with two fraction digits', () => {
    expect(money(1548.5)).toBe('$1,548.50');
  });
});

describe('percentChange', () => {
  it('returns the percent delta when the prior value is non-zero', () => {
    expect(percentChange(120, 100)).toBe(20);
  });

  it('returns 0 when both values are 0', () => {
    expect(percentChange(0, 0)).toBe(0);
  });

  it('returns null when the prior value is 0 and current is not', () => {
    expect(percentChange(10, 0)).toBeNull();
  });
});
