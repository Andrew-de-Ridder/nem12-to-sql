import { INDEX_INTERVAL_LENGTH, RECORD_TYPE_200, RECORD_TYPE_300, RECORD_TYPE_500 } from '#constants';
import { getLineReader, writeBeginSqlTransactionLineToFile, writeCommitSqlTransactionLineToFile, writeInsertStatements } from '#io';
import { processConsumption, resetRecord, transformRecordToSqlInserts } from '#processors';
import { parseIntervalLength } from '#parsers';
import type { IntervalLength, IRecord } from '#types';

export async function main() {
  await writeBeginSqlTransactionLineToFile();
  const record: IRecord = {
    intervalRecord: { intervalLength: 30, nmi: '' },
    adjustmentRecords: [],
  };

  for await (const line of getLineReader()) {
    const parts: string[] = line.split(',');
    const [recordType] = parts;

    switch (recordType) {
      case RECORD_TYPE_200: {
        const intervalLength: IntervalLength = parseIntervalLength(parts[INDEX_INTERVAL_LENGTH]);
        resetRecord(parts, record, intervalLength);
        break;
      }
      case RECORD_TYPE_300: {
        processConsumption(parts, record);
        break;
      }
      case RECORD_TYPE_500: {
        const sqlInserts = await transformRecordToSqlInserts(record);
        await writeInsertStatements(sqlInserts);
        break;
      }
    }
  }

  await writeCommitSqlTransactionLineToFile();
  console.log('Completed.');
}
