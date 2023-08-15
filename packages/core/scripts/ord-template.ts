import { readFile, writeFile } from 'fs/promises';

export async function getOrdTemplate() {
  let template = await readFile('./bridge-card/ord.html', 'utf8');
  template = template.replaceAll('card.js', '{{CARD_SRC}}');
  template = template.replaceAll('hank.btc', '{{CARD_NAME}}');
  return template;
}

function getOrdJs(template: string) {
  return `export const ordCardTemplate = \`${template}\`;\n`;
}

async function run() {
  const template = await getOrdTemplate();
  const js = getOrdJs(template);
  await writeFile('./src/bridge/card.ts', js, { encoding: 'utf8' });
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
