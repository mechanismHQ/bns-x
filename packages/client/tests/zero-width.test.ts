import {
  codeToString,
  debugCodePoints,
  hasInvalidExtraZwj,
  hasZeroWidth,
  replaceZeroWidth,
  ZERO_WIDTH_POINTS,
} from '../src/zero-width';
import { validZwjEmojiRegex } from '../src/zero-width-regexp';
import zwjSequences from '@unicode/unicode-15.0.0/Sequence_Property/RGI_Emoji_ZWJ_Sequence';
import { inspect } from 'util';

function codeToPoint(code: string) {
  const str = code.length % 2 !== 0 ? `0${code}` : code;
  return parseInt(str, 16);
}

function expectValidSwj(str: string) {
  const isInvalid = hasInvalidExtraZwj(str);
  if (isInvalid) {
    console.log({
      str,
      codePoints: debugCodePoints(str),
      message: 'should be valid',
    });
    // console.log(str, 'invalid');
    throw new Error(`Expected ${str} to be valid`);
  }
}

test('replaces zero-width chars', () => {
  const str = 'asdf asdf';
  expect(replaceZeroWidth(str)).toEqual('asdfasdf');
  expect(hasZeroWidth(str)).toBeTruthy();

  expect(hasInvalidExtraZwj('🧜🏻‍')).toEqual(true);
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

test('returns ok for valid zwj sequences', () => {
  zwjSequences.forEach(str => {
    expectValidSwj(str);
    expectValidSwj(`${str}${str}`);
  });
});

test('spot checking', () => {
  expect(hasInvalidExtraZwj('🧔‍♂️')).toEqual(false);
});

test('strings with added zwj are invalid', () => {
  zwjSequences.forEach(str => {
    ZERO_WIDTH_POINTS.forEach(c => {
      const newStr = str + codeToString(c);
      const isInvalid = hasInvalidExtraZwj(newStr);
      if (!isInvalid) {
        console.log(c, codeToString(c), c.toString(16));
        console.log(debugCodePoints(newStr));
        console.log({
          matches: newStr.match(validZwjEmojiRegex)?.map(m => debugCodePoints(m)),
        });
        // newStr.match(validZwjEmojiRegex)?.forEach(m => {
        //   console.log(debugCodePoints(m));
        // });
        console.log(debugCodePoints(newStr.replaceAll(validZwjEmojiRegex, '')));
        console.log(newStr.replaceAll(validZwjEmojiRegex, '').length);
        console.log(newStr, 'should be invalid');
      }
      expect(hasInvalidExtraZwj(newStr)).toBeTruthy();
    });
  });
});
