const code = await Deno.readTextFile("./contracts/name-wrapper.clar");

function file(code: string) {
  return `
  export const nameWrapperCode = \`${code}\`;
  `;
}

await Deno.writeTextFile("./tests/mocks/wrapper.ts", file(code));

// const testnet = code.replaceAll(
//   "SP000000000000000000002Q6VF78",
//   "ST000000000000000000002AMW42H"
// );
const testnet = await Deno.readTextFile(
  "./contracts/testnet/name-wrapper.clar"
);
await Deno.writeTextFile("./web/common/wrapper-code.ts", file(testnet));
