import { buildFile } from 'scripts/export-trpc/file';
import { buildTypeNode } from './utils';
import { appRouter } from '@routes/trpc';
import { writeFile } from 'fs/promises';
import prettier from 'prettier';

async function run() {
  const [filePath] = process.argv.slice(2);
  if (!filePath) {
    throw new Error('Invalid usage: must include <filePath> arg');
  }

  const typeNode = buildTypeNode(appRouter);
  const file = buildFile(typeNode);
  const config = await prettier.resolveConfig(process.cwd());
  const formatted = prettier.format(file, { parser: 'typescript', ...config });

  await writeFile(filePath, formatted, { encoding: 'utf-8' });
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
