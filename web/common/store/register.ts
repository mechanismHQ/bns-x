import { atom } from 'jotai';
import { hashAtom, txidQueryAtom } from './migration';
import { toPunycode } from '@bns-x/punycode';
import { atomWithDebounce } from './atom-utils';

export const registerTxIdAtom = hashAtom('registerTxid');
export const registrationTxAtom = txidQueryAtom(registerTxIdAtom)[0];

// export const nameInputAtom = atom('');

export const registrationNameState = atom(get => {
  const withoutDot = get(nameInputAtom.debouncedValueAtom).split('.')[0]!;
  const lower = withoutDot.toLowerCase();
  const puny = toPunycode(lower);
  return puny;
});

export const nameIsPunyState = atom(get => {
  const puny = get(registrationNameState);
  return puny !== get(nameInputAtom.debouncedValueAtom);
});

export const nameInputAtom = atomWithDebounce('');
