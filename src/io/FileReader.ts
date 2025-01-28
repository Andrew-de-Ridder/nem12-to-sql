import { fetchInputFilePath } from '#config';
import fs from 'fs';
import { ReadStream } from 'node:fs';
import { Interface } from 'node:readline';
import readline from 'readline';

export function getLineReader(): Interface {
  const filepath = fetchInputFilePath();
  console.log(`Reading NEM12 file from path: ${filepath}`);
  const fileStream: ReadStream = fs.createReadStream(filepath);
  return readline.createInterface({
    crlfDelay: Infinity,
    input: fileStream,
  });
}
