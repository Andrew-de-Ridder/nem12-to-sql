// compare.js
import { createReadStream } from 'fs';
import { createHash } from 'crypto';

const file1 = process.argv[2];
const file2 = process.argv[3];

// Function to get the hash of a file
function getFileHash(filePath: string) {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    const stream = createReadStream(filePath);

    stream.on('data', (chunk) => {
      hash.update(chunk);
    });

    stream.on('end', () => {
      resolve(hash.digest('hex'));
    });

    stream.on('error', (err) => {
      reject(err);
    });
  });
}

// Compare the files
async function compareFiles() {
  try {
    if (!file1 || !file2) {
      console.error('Please provide two file paths.');
      process.exit(1);
    }

    const [hash1, hash2] = await Promise.all([getFileHash(file1), getFileHash(file2)]);

    if (hash1 === hash2) {
      console.log('End-to-end testing complete');
    } else {
      console.error('Files are different.');
      process.exit(1);
    }
  } catch (err) {
    console.error('Error comparing files:', err);
    process.exit(1);
  }
}

compareFiles();
