import { describe, it, expect } from 'vitest';
import { parseIntervalDate } from './IntervalDateParser.js';

describe('parseIntervalDate', () => {
  it('should parse a valid date string into a Date object', () => {
    // Setup
    const dateString = '20230101';

    // Execute SUT
    const result = parseIntervalDate(dateString);

    // Verify
    expect(result?.toISOString()).toBe('2023-01-01T00:00:00.000Z');
  });

  it('should return null for invalid date format', () => {
    // Setup
    const dateString = '2023-01-01';

    // Execute SUT
    const result = parseIntervalDate(dateString);

    // Verify
    expect(result).toBeNull();
  });

  it('should return null for a date string with length <= 7', () => {
    // Setup
    const shortDateString1 = '2023';
    const shortDateString2 = '12345';

    // Execute SUT
    const result1 = parseIntervalDate(shortDateString1);
    const result2 = parseIntervalDate(shortDateString2);

    // Verify
    expect(result1).toBeNull();
    expect(result2).toBeNull();
  });

  it('should return null for undefined input', () => {
    // Setup
    const dateString = undefined;

    // Execute SUT
    const result = parseIntervalDate(dateString);

    // Verify
    expect(result).toBeNull();
  });

  it('should return null for empty string input', () => {
    // Setup
    const dateString = '';

    // Execute SUT
    const result = parseIntervalDate(dateString);

    // Verify
    expect(result).toBeNull();
  });
});
