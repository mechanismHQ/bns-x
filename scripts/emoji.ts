import {
  asciiToBytes,
  bytesToHex,
  hexToBytes,
  utf8ToBytes,
} from "micro-stacks/common";
import { toASCII } from "punycode";

const emojis = ["🤯", "😇", "🕵🏽‍♂️", "🕵🏽‍♂️", "🕵🏽♂"];

console.log(asciiToBytes("xn--"));
console.log(utf8ToBytes("xn--"));
console.log(bytesToHex(utf8ToBytes("xn--")));

console.log("Punycode starter:");
console.log(bytesToHex(asciiToBytes("xn--")));

emojis.forEach((e) => {
  const bytes = utf8ToBytes(e);
  console.log(e, bytes.length, bytesToHex(bytes));

  console.log(toASCII(e).length);
});
