export function timeDelta(start: number, end: number): string {
  return ((end - start) / 1000).toPrecision(3);
}
