import { compareValues, nextDir } from './sort';

describe('nextDir', () => {
  it('starts descending when the sort key changes', () => {
    expect(nextDir('amount', 'date', 'asc')).toBe('desc');
  });

  it('toggles direction when the same key is clicked again', () => {
    expect(nextDir('amount', 'amount', 'desc')).toBe('asc');
    expect(nextDir('amount', 'amount', 'asc')).toBe('desc');
  });
});

describe('compareValues', () => {
  it('orders numbers and strings by the requested direction', () => {
    expect(compareValues(2, 10, 'asc')).toBe(-1);
    expect(compareValues(2, 10, 'desc')).toBe(1);
    expect(compareValues('wire', 'card', 'asc')).toBe(1);
    expect(compareValues('a', 'a', 'asc')).toBe(0);
  });
});
