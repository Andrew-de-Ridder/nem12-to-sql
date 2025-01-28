export interface IMeterReadingDao {
  nmi: string;
  timestamp: Date;
  consumption: number;
}

export type IntervalLength = 5 | 15 | 30;

export interface IRecord200 {
  /* NMI for the connection point. Does not include check-digit or NMI suffix. Second value in a 200 record. */
  nmi: string;
  /* Time in minutes of each Interval period: 5, 15, or 30. Ninth value in a 200 record. */
  intervalLength: IntervalLength;
}

export interface IRecord300 {
  /* Interval date. Second value in a 300 record. */
  intervalDate: Date;
  /* Interval values, which we call consumption. Values 3-50 in a 300 record. */
  consumption: number;
}

export interface IRecord {
  /* NMI data details record (200). */
  intervalRecord: IRecord200;
  /* Interval data record (300). Multiple 300 records can belong to each 200 record. */
  adjustmentRecords: IRecord300[];
}

interface IMainParams {
  getLineReader: () => AsyncIterable<string>;
  writeBeginTransaction: () => Promise<void>;
  writeInsertStatements: (insertStatements: string[]) => Promise<void>;
  writeCommitTransaction: () => Promise<void>;
  transformRecordToSqlInserts: (record: IRecord) => Promise<string[]>;
  parseIntervalLength: (intervalLength: string | undefined) => IntervalLength;
  parseIntervalDate: (dateString: string) => Date | null;
}
