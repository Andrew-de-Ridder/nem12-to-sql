import { describe, it, expect } from 'vitest';
import { IntervalLength, IRecord } from '#types';
import { transformRecordToSqlInserts, resetRecord, processConsumption } from '#processors';

describe('transformRecordToSqlInserts', () => {
  it('should generate SQL insert statements for a valid record', async () => {
    // Setup
    const record: IRecord = {
      intervalRecord: {
        nmi: 'NMI123456789',
        intervalLength: 15,
      },
      adjustmentRecords: [{ intervalDate: new Date('2023-01-01T00:00:00Z'), consumption: 100 }],
    };

    // Execute SUT
    const result = await transformRecordToSqlInserts(record);

    // Verify
    expect(result).toEqual([`INSERT INTO meter_readings ("nmi", "timestamp", "consumption") VALUES ('NMI123456789', '2023-01-01T00:00:00.000Z', 100);`]);
  });

  it('should handle multiple adjustment records correctly', async () => {
    // Setup
    const record: IRecord = {
      intervalRecord: {
        nmi: 'NMI987654321',
        intervalLength: 30,
      },
      adjustmentRecords: [
        { intervalDate: new Date('2023-01-02T00:00:00Z'), consumption: 150 },
        { intervalDate: new Date('2023-01-02T00:30:00Z'), consumption: 250 },
        { intervalDate: new Date('2023-01-02T01:00:00Z'), consumption: 350 },
      ],
    };

    // Execute SUT
    const result = await transformRecordToSqlInserts(record);

    // Verify
    expect(result).toEqual([
      `INSERT INTO meter_readings ("nmi", "timestamp", "consumption") VALUES ('NMI987654321', '2023-01-02T00:00:00.000Z', 150);`,
      `INSERT INTO meter_readings ("nmi", "timestamp", "consumption") VALUES ('NMI987654321', '2023-01-02T00:30:00.000Z', 250);`,
      `INSERT INTO meter_readings ("nmi", "timestamp", "consumption") VALUES ('NMI987654321', '2023-01-02T01:00:00.000Z', 350);`,
    ]);
  });

  it('should return an empty array if there are no adjustment records', async () => {
    // Setup
    const record: IRecord = {
      intervalRecord: {
        nmi: 'NMI000000000',
        intervalLength: 5,
      },
      adjustmentRecords: [],
    };

    // Execute SUT
    const result = await transformRecordToSqlInserts(record);

    // Verify
    expect(result).toEqual([]);
  });
});

describe('resetRecord', () => {
  it('should reset record properties based on parts and intervalLength', () => {
    // Setup
    const parts: string[] = ['200', 'NMI123456789', '', '']; // Example of valid record parts
    const record: IRecord = {
      intervalRecord: { nmi: 'oldNmi', intervalLength: 30 },
      adjustmentRecords: [{ consumption: 100, intervalDate: new Date() }],
    };
    const intervalLength: IntervalLength = 30; // Example of interval length

    // Execute SUT
    resetRecord(parts, record, intervalLength);

    // Verify
    expect(record.intervalRecord.nmi).toBe('NMI123456789'); // Check if nmi is set correctly
    expect(record.intervalRecord.intervalLength).toBe(30); // Check if intervalLength is set correctly
    expect(record.adjustmentRecords).toEqual([]); // Ensure adjustmentRecords is reset
  });

  it('should set nmi to an empty string when parts do not contain nmi value', () => {
    // Setup
    const parts: string[] = ['200', '', '', '']; // parts array with no NMI value
    const record: IRecord = {
      intervalRecord: { nmi: 'oldNmi', intervalLength: 30 },
      adjustmentRecords: [{ consumption: 100, intervalDate: new Date() }],
    };
    const intervalLength: IntervalLength = 30;

    // Execute SUT
    resetRecord(parts, record, intervalLength);

    // Verify
    expect(record.intervalRecord.nmi).toBe(''); // nmi should be reset to an empty string
    expect(record.intervalRecord.intervalLength).toBe(30); // intervalLength should still be set
    expect(record.adjustmentRecords).toEqual([]); // adjustmentRecords should be reset
  });

  it('should reset adjustmentRecords even if they are already empty', () => {
    // Setup
    const parts: string[] = ['200', 'NMI987654321', '', ''];
    const record: IRecord = {
      intervalRecord: { nmi: 'oldNmi', intervalLength: 30 },
      adjustmentRecords: [], // Already empty
    };
    const intervalLength: IntervalLength = 15;

    // Execute SUT
    resetRecord(parts, record, intervalLength);

    // Verify
    expect(record.intervalRecord.nmi).toBe('NMI987654321'); // nmi should be updated
    expect(record.intervalRecord.intervalLength).toBe(15); // intervalLength should be updated
    expect(record.adjustmentRecords).toEqual([]); // adjustmentRecords should be reset (even if they were already empty)
  });

  it('should handle undefined nmi and reset adjustmentRecords', () => {
    // Setup
    const parts: string[] = []; // Empty parts array
    const record: IRecord = {
      intervalRecord: { nmi: 'oldNmi', intervalLength: 30 },
      adjustmentRecords: [{ consumption: 100, intervalDate: new Date() }],
    };
    const intervalLength: IntervalLength = 15;

    // Execute SUT
    resetRecord(parts, record, intervalLength);

    // Verify
    expect(record.intervalRecord.nmi).toBe(''); // nmi should be set to an empty string
    expect(record.intervalRecord.intervalLength).toBe(15); // intervalLength should be updated
    expect(record.adjustmentRecords).toEqual([]); // adjustmentRecords should be reset
  });
});

describe('processConsumption', () => {
  it('should correctly process consumption data and update adjustmentRecords', () => {
    // Setup
    const parts: string[] =
      '300,20050301,0,0,0,0,0,0,0,0,0,0,0,0,0.461,0.810,0.568,1.234,1.353,1.507,1.344,1.773,0.848,1.271,0.895,1.327,1.013,1.793,0.988,0.985,0.876,0.555,0.760,0.938,0.566,0.512,0.970,0.760,0.731,0.615,0.886,0.531,0.774,0.712,0.598,0.670,0.587,0.657,0.345,0.231,A,,,20050310121004,20050310182204'.split(
        ','
      );
    const record: IRecord = {
      intervalRecord: { nmi: '', intervalLength: 30 },
      adjustmentRecords: [],
    };

    // Execute SUT
    processConsumption(parts, record);

    // Verify
    expect(record?.adjustmentRecords).toHaveLength(45); // 6 values should be processed
    expect(record?.adjustmentRecords[0]?.consumption).toBe(0); // First consumption value should be 10
    expect(record?.adjustmentRecords[15]?.consumption).toBe(1.234); // Last consumption value should be 60
    expect(record?.adjustmentRecords[0]?.intervalDate).toEqual(new Date('2005-03-01T00:00:00.000Z')); // Check intervalDate
    expect(record?.adjustmentRecords[15]?.intervalDate).toEqual(new Date('2005-03-01T07:30:00.000Z')); // Check for last interval date
  });

  it('should handle an empty consumption array and not add adjustment records', () => {
    // Setup
    const parts: string[] = ['300', '', '', '', '2023-01-01T00:00:00Z']; // Empty consumption
    const record: IRecord = {
      intervalRecord: { nmi: '', intervalLength: 15 },
      adjustmentRecords: [],
    };

    // Execute SUT
    processConsumption(parts, record);

    // Verify
    expect(record.adjustmentRecords).toHaveLength(0); // No adjustment records should be added
  });

  it('should correctly handle invalid intervalDate (null case)', () => {
    // Setup
    const parts: string[] = [
      '300',
      '',
      '',
      '',
      '',
      '10',
      '20',
      '30', // Mock parts with consumption but invalid date
    ];
    const record: IRecord = {
      intervalRecord: { nmi: '', intervalLength: 15 },
      adjustmentRecords: [],
    };

    // Use real parseIntervalDate, which will return null
    processConsumption(parts, record);

    // Verify
    expect(record.adjustmentRecords).toHaveLength(0); // No adjustment records should be added as date is invalid
  });
});
