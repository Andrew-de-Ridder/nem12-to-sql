import type { IntervalLength } from '#types';

export function parseIntervalLength(intervalLength: string | undefined): IntervalLength {
  switch (intervalLength) {
    case '5':
      return 5;
    case '15':
      return 15;
    case '30':
      return 30;
  }
  /* Defaulting to 30 here, but would need to check with PO what correct
    behaviour should be in case of invalid or missing IntervalLength */
  return 30;
}
