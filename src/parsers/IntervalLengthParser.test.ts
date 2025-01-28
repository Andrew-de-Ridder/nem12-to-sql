import { describe, it, expect } from 'vitest';
import { parseIntervalLength } from './IntervalLengthParser.js';

describe('parseIntervalLength', () => {
  it('should return 5 for interval "5"', () => {
    // Setup
    const intervalLength = '5';

    // Execute SUT
    const result = parseIntervalLength(intervalLength);

    // Verify
    expect(result).toBe(5);
  });

  it('should return 15 for interval "15"', () => {
    // Setup
    const intervalLength = '15';

    // Execute SUT
    const result = parseIntervalLength(intervalLength);

    // Verify
    expect(result).toBe(15);
  });

  it('should return 30 for interval "30"', () => {
    // Setup
    const intervalLength = '30';

    // Execute SUT
    const result = parseIntervalLength(intervalLength);

    // Verify
    expect(result).toBe(30);
  });

  it('should return 30 for invalid interval value', () => {
    // Setup
    const intervalLength = '60'; // Invalid value

    // Execute SUT
    const result = parseIntervalLength(intervalLength);

    // Verify
    expect(result).toBe(30);
  });

  it('should return 30 for missing interval value', () => {
    // Setup
    const intervalLength = undefined;

    // Execute SUT
    const result = parseIntervalLength(intervalLength);

    // Verify
    expect(result).toBe(30);
  });

  it('should return 30 for empty string interval value', () => {
    // Setup
    const intervalLength = '';

    // Execute SUT
    const result = parseIntervalLength(intervalLength);

    // Verify
    expect(result).toBe(30);
  });
});
