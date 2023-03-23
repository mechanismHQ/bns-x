import { puny_decoded, puny_encoded } from '@adraffy/punycode';
import { codeToString } from './zero-width';

export function toUnicode(punycode: string) {
  return punycode
    .split('.')
    .map(part =>
      puny_decoded(part)
        .map(c => codeToString(c))
        .join('')
    )
    .join('.');
}

export function toPunycode(unicode: string) {
  return puny_encoded(unicode);
}
