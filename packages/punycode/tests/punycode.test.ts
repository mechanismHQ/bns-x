import { puny_decode, puny_decoded } from '@adraffy/punycode';
import { toUnicode, toPunycode, fullDisplayName, INVALID_PUNY_ICON } from '../src/punycode';
import { debugCodePoints, hasInvalidExtraZwj } from '../src/zero-width';

function expectInvalid(str: string) {
  const uni = toUnicode(str);
  const isInvalid = hasInvalidExtraZwj(uni);
  if (!isInvalid) {
    console.log({
      str,
      uni,
      len: uni.length,
      normalSame: uni === uni.normalize('NFC'),
      message: 'should be invalid',
      normalized: uni.normalize('NFC').length,
      punyPoints: puny_decoded(str).map(c => c.toString(16)),
      decoded: debugCodePoints(uni),
      d: String.fromCharCode(...puny_decoded(str)),
    });
    // console.log(str, uni, 'should be invalid');
    // console.log(puny_decoded(str).map(c => c.toString(16)));
    throw new Error(`Expected ${str} to be invalid`);
  }
}

function expectValid(str: string) {
  const uni = toUnicode(str);
  const isInvalid = hasInvalidExtraZwj(uni);
  if (isInvalid) {
    console.log({
      str,
      uni,
      message: 'should be valid',
      normalized: uni.normalize('NFC'),
      punyPoints: puny_decoded(str).map(c => c.toString(16)),
      decoded: debugCodePoints(uni),
      d: String.fromCharCode(...puny_decoded(str)),
    });
    // console.log(str, uni, 'should be valid');
    // console.log(puny_decoded(str).map(c => c.toString(16)));
    throw new Error(`Expected ${str} to be valid`);
  }
}

test('flags valid and invalid strings', () => {
  expectValid('xn--1ug66vku9r8p9h');
  expectValid('xn--1ug66vku9r8p9h.btc');
  expectInvalid('xn--1ug66v1y95b');
  // expectInvalid('xn--qei94312j'); // tricky
  expectInvalid('xn--1ug2145p8xd');
  expectInvalid('xn--1ug2145p8xd.btc');
});

test('converting back and forth', () => {
  expect(toPunycode('hank.btc')).toEqual('hank.btc');
  expect(toPunycode(toUnicode('xn--1ug66vku9r8p9h'))).toEqual('xn--1ug66vku9r8p9h');
});

test('full display name', () => {
  const name = 'xn--1ug2145p8xd.btc';

  const display = fullDisplayName(name);

  expect(display).toEqual(`xn--1ug2145p8xd.btc (🧜🏻‍.btc${INVALID_PUNY_ICON})`);

  expect(fullDisplayName('example.btc')).toEqual('example.btc');

  expect(fullDisplayName('xn--1ug66vku9r8p9h.btc')).toEqual('xn--1ug66vku9r8p9h.btc (🧔‍♂️.btc)');
});
