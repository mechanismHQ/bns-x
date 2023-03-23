import zwjSequences from '@unicode/unicode-15.0.0/Sequence_Property/RGI_Emoji_ZWJ_Sequence';
import { writeFile } from 'fs/promises';
import { resolve } from 'path';

const regexPoints = zwjSequences
  .sort((a, b) => b.length - a.length)
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  .map(emoji => Array.from(emoji).map(cp => cp.codePointAt(0)!));

const regexStr = zwjSequences
  .sort((a, b) => b.length - a.length)
  .map(emoji =>
    Array.from(emoji)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .map(cp => `\\u{${cp.codePointAt(0)!.toString(16)}}`)
      .join('')
  )
  // .map(r => `${r}`)
  .join('|');
// .forEach(r => set.add(r));
// .join('|');

const fileContents = `export const validZwjEmojiRegex = new RegExp(\`${regexStr}\`, 'ug');`;

async function run() {
  const filePath = resolve(__dirname, '../src/zero-width-regexp.ts');
  await writeFile(filePath, fileContents, 'utf8');
}

run()
  .catch(console.error)
  .finally(() => {
    process.exit();
  });
