import { validZwjEmojiRegex } from './zero-width-regexp';

export function codeToString(codePt: number) {
  if (codePt > 0xffff) {
    codePt -= 0x10000;
    return String.fromCharCode(0xd800 + (codePt >> 10), 0xdc00 + (codePt & 0x3ff));
  } else {
    return String.fromCharCode(codePt);
  }
}

export function debugCodePoints(str: string) {
  return Array.from(str)
    .map(c => c.codePointAt(0)?.toString(16))
    .join(' ');
}

export function zeroWidthRegex() {
  const groups = ZERO_WIDTH_POINTS.map(code => codeToString(code));
  return new RegExp(`[${groups.join('|')}]+`, 'ug');
}

export function replaceZeroWidth(str: string, replacer = '') {
  return str.replaceAll(zeroWidthRegex(), replacer);
}

export function hasZeroWidth(str: string) {
  return zeroWidthRegex().test(str);
}

export function hasInvalidExtraZwj(str: string) {
  const withoutValid = str.replaceAll(validZwjEmojiRegex, '');
  return hasZeroWidth(withoutValid);
}

export const ZERO_WIDTH_POINTS = [
  0x0009, 0x0020, 0x00a0, 0x00ad, 0x034f, 0x061c, 0x115f, 0x1160, 0x17b4, 0x17b5, 0x180e, 0x2000,
  0x2001, 0x2002, 0x2003, 0x2004, 0x2005, 0x2006, 0x2007, 0x2008, 0x2009, 0x200a, 0x200b, 0x200c,
  0x200d, 0x200e, 0x200f, 0x202f, 0x205f, 0x2060, 0x2061, 0x2062, 0x2063, 0x2064, 0x206a, 0x206b,
  0x206c, 0x206d, 0x206e, 0x206f, 0x3000, 0x2800, 0x3164, 0xfeff, 0xffa0, 0x1d159, 0x1d173, 0x1d174,
  0x1d175, 0x1d176, 0x1d177, 0x1d178, 0x1d179, 0x1d17a,
];
