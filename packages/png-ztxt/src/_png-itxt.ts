import png from 'png-itxt';
import { createReadStream, createWriteStream } from 'fs';

createReadStream('./data/card.png')
  .pipe(png.set({ keyword: 'testerz', value: 'some_text', type: png.zTXt }, true))
  .pipe(png.set({ keyword: 'testert', value: 'some_text', type: png.tEXt }, true))
  .pipe(png.set({ keyword: 'tester', value: 'some_text', type: png.iTXt }, true))
  .on('end', () => {
    console.log('done');
  })
  .pipe(createWriteStream('./data/card3.png'));

// createReadStream('./data/card2.png').pipe(
//   png.get('tester', (err, data) => {
//     console.log(err, data);
//   })
// );

// async function run() {
//   createReadStream('./data/card.png').pipe(png.set({ keyword: 'tester', value: 'some_text' }));
// }

// run()
//   .catch(console.error)
//   .finally(() => {
//     process.exit();
//   });
