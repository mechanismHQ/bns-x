import { puny_decoded, puny_encoded } from '@adraffy/punycode';
import { codeToString, hasInvalidExtraZwj } from './zero-width';

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
  return unicode
    .split('.')
    .map(part => puny_encoded(part))
    .join('.');
}

export function fullDisplayName(name: string) {
  const puny = toUnicode(name);
  let displayName = name;
  if (puny !== name) {
    const flagged = hasInvalidExtraZwj(puny) ? '🟥' : '';
    displayName = `${name} (${puny}${flagged})`;
  }
  return displayName;
}
