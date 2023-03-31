const code = await Deno.readTextFile('./contracts/name-wrapper-v2.clar');
const oldCode = await Deno.readTextFile('./contracts/name-wrapper.clar');
const template = await Deno.readTextFile('./dscripts/wrapper-js-template.ts');

function serialize(code: string) {
  return code.replaceAll('`', '\\`');
}

function makeTemplate(currentCode: string, oldCode: string) {
  return template
    .replace('$$CODE$$', serialize(currentCode))
    .replace('$$OLD_CODE$$', serialize(oldCode));
}

await Deno.writeTextFile('./tests/mocks/wrapper.ts', makeTemplate(code, oldCode));

const testnet = await Deno.readTextFile('./contracts/testnet/name-wrapper-v2.clar');
const testnetOld = await Deno.readTextFile('./contracts/testnet/name-wrapper.clar');
await Deno.writeTextFile(
  '../packages/client/src/wrapper-code.ts',
  makeTemplate(testnet, testnetOld)
);
