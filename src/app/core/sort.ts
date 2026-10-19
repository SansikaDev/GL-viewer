export type SortDir = 'asc' | 'desc';

export function nextDir(currentKey: string, nextKey: string, currentDir: SortDir): SortDir {
  if (currentKey !== nextKey) {
    return 'desc';
  }
  return currentDir === 'desc' ? 'asc' : 'desc';
}

export function compareValues(left: string | number, right: string | number, dir: SortDir): number {
  const result = left < right ? -1 : left > right ? 1 : 0;
  return dir === 'asc' ? result : -result;
}
