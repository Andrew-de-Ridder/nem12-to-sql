import { fetchOutputFilePath } from '#config';
import fs from 'fs';
import path from 'path';

const filePath: string = fetchOutputFilePath();

export async function writeBeginSqlTransactionLineToFile() {
  try {
    const dirPath = path.dirname(filePath);
    await fs.promises.mkdir(dirPath, { recursive: true });
    await fs.promises.writeFile(filePath, 'BEGIN;', 'utf8');
  } catch (error) {
    console.error('Error writing to file:', error);
  }
}

export async function writeInsertStatements(insertStatements: string[]) {
  await appendToFile(`\n${insertStatements.join('\n')}`);
}

export async function writeCommitSqlTransactionLineToFile() {
  await appendToFile('\nCOMMIT;');
  console.log(`Please see results in "${filePath}" sql file. `);
}

export async function appendToFile(data: string) {
  try {
    await fs.promises.appendFile(filePath, data, 'utf8');
  } catch (error) {
    console.error('Error writing to file:', error);
  }
}
