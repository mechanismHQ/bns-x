import { bytesToAscii, hexToBytes } from 'micro-stacks/common';

const [hex] = process.argv.slice(2);

const bytes = hexToBytes(hex.replace(/^0x/, ''));
const ascii = bytesToAscii(bytes);
console.log(ascii);
