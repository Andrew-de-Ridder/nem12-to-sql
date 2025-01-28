import type { IntervalLength, IRecord, IRecord300 } from '#types';
import { INDEX_CONSUMPTION_BEGIN, INDEX_INTERVAL_DATE, INDEX_NMI, MILLISECONDS_IN_MINUTE, MINUTES_IN_DAY } from '#constants';
import { parseIntervalDate } from '#parsers';

export async function transformRecordToSqlInserts(record: IRecord): Promise<string[]> {
  console.log(`Processing record with NMI: ${JSON.stringify(record.intervalRecord.nmi)}`);
  const insertStatement = `INSERT INTO meter_readings ("nmi", "timestamp", "consumption")`;
  const insertStatements: string[] = [];
  record.adjustmentRecords.forEach((adjustmentRecord: IRecord300) => {
    const { nmi: nmi } = record.intervalRecord;
    const time = new Date(adjustmentRecord.intervalDate).toISOString();
    const valueStatement = `VALUES ('${nmi}', '${time}', ${adjustmentRecord.consumption});`;
    insertStatements.push(`${insertStatement} ${valueStatement}`);
  });
  return new Promise<string[]>((resolve) => {
    resolve(insertStatements);
  });
}

export function resetRecord(parts: string[], record: IRecord, intervalLength: IntervalLength) {
  record.intervalRecord.nmi = parts[INDEX_NMI] ?? '';
  record.intervalRecord.intervalLength = intervalLength;
  record.adjustmentRecords = [];
}

export function processConsumption(parts: string[], record: IRecord) {
  const intervalLength = record.intervalRecord.intervalLength;
  const indexConsumptionEnd = MINUTES_IN_DAY / intervalLength - 1;
  const consumption: number[] = parts.slice(INDEX_CONSUMPTION_BEGIN, indexConsumptionEnd).map(Number);
  const intervalDate = parseIntervalDate(parts[INDEX_INTERVAL_DATE]);

  if (intervalDate) {
    consumption.forEach((value: number, index: number) => {
      const intervalDateTime = new Date(intervalDate.getTime() + index * intervalLength * MILLISECONDS_IN_MINUTE);
      record.adjustmentRecords.push({
        consumption: value,
        intervalDate: intervalDateTime,
      });
    });
  }
}
