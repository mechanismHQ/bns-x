import {
  codeToString,
  hasZeroWidth,
  replaceZeroWidth,
  ZERO_WIDTH_POINTS,
} from '../src/client/zero-width';

function codeToPoint(code: string) {
  const str = code.length % 2 !== 0 ? `0${code}` : code;
  return parseInt(str, 16);
}

test('replaces zero-width chars', () => {
  const str = 'asdf asdf';
  expect(replaceZeroWidth(str)).toEqual('asdfasdf');
  expect(hasZeroWidth(str)).toBeTruthy();
});

test('replaces all zero-width chars', () => {
  const str = ZERO_WIDTH_POINTS.map(code => codeToString(code)).join('');
  expect(replaceZeroWidth(str)).toEqual('');
  expect(hasZeroWidth(str)).toBeTruthy();
});

test('replacing individually', () => {
  ZERO_WIDTH_POINTS.forEach(c => {
    if (replaceZeroWidth(codeToString(c)) !== '') {
      console.log(c);
      throw new Error('Invalid - didnt fix code');
    }
  });
});
