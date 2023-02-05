const code = await Deno.readTextFile('./contracts/name-wrapper.clar');

function file(code: string) {
  const fixed = code.replaceAll('`', '\\`');
  return `export const nameWrapperCode = \`${fixed}\`;
`;
}

await Deno.writeTextFile('./tests/mocks/wrapper.ts', file(code));

// const testnet = code.replaceAll(
//   "SP000000000000000000002Q6VF78",
//   "ST000000000000000000002AMW42H"
// );
const testnet = await Deno.readTextFile('./contracts/testnet/name-wrapper.clar');
await Deno.writeTextFile('./web/common/wrapper-code.ts', file(testnet));

await Deno.writeTextFile('./indexer/src/client/wrapper-code.ts', file(testnet));
