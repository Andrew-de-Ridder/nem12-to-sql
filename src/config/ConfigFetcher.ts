import { config } from '@dotenvx/dotenvx';
config();
import fs from 'fs';

export function fetchInputFilePath(): string {
  const inputFilePath: string = process.env.INPUT_FILE ?? '';
  if (!inputFilePath) {
    console.error('The input file path is required.');
    process.exitCode = 1;
  } else if (!fs.existsSync(inputFilePath)) {
    console.error(`The input file path provide must be a file: ${inputFilePath}`);
    process.exitCode = 1;
  }
  return inputFilePath;
}
export function fetchOutputFilePath(): string {
  const outputFilePath: string = process.env.OUTPUT_FILE ?? '';
  if (!outputFilePath) {
    console.error('The output file path is required.');
    process.exitCode = 1;
  }
  return outputFilePath;
}
