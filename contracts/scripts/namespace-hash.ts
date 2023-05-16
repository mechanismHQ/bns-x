import { utf8ToBytes, bytesToUtf8, asciiToBytes, bytesToHex } from 'micro-stacks/common';
import { hashRipemd160 } from 'micro-stacks/crypto';
import { spawn } from 'child_process';

const [namespaceUtf8, saltUtf8] = process.argv.slice(0);

const salt = utf8ToBytes(saltUtf8);
const namespace = utf8ToBytes(namespaceUtf8);

const fullBuff = new Uint8Array([...namespace, ...salt]);
const hash = hashRipemd160(fullBuff);

const namespaceFromAscii = asciiToBytes(namespaceUtf8);

if ([...namespaceFromAscii].join(',') !== [...namespace].join(',')) {
  throw new Error('Namespace mismatch');
}

const hashUtf8 = bytesToUtf8(hash);

function pbcopy(data: string) {
  const proc = spawn('pbcopy');
  proc.stdin.write(data);
  proc.stdin.end();
}

console.log('UTF8 hash', hashUtf8);
console.log('Hash bytes', bytesToHex(hash));

pbcopy(hashUtf8);
