import { ALL_NAMESPACES } from './namespaces';

export type NamespaceProperties = (typeof ALL_NAMESPACES)['stx'];

export type Namespaces = keyof typeof ALL_NAMESPACES;

export const NAMESPACES = Object.keys(ALL_NAMESPACES) as Namespaces[];

export function hasVowels(name: string) {
  return /[aeiou]/i.test(name.toLowerCase());
}

export function hasNonAlpha(name: string) {
  return /[\d\-_]/i.test(name);
}

export function computeNamePrice(name: string, namespace: string) {
  const props = ALL_NAMESPACES[namespace as keyof typeof ALL_NAMESPACES];
  if (typeof props === undefined) {
    throw new Error('Unable to compute name price - invalid namespace');
  }
  const exponentIndex = Math.min(15, name.length - 1);
  const pf = props.priceFunction;
  const exponent = pf.buckets[exponentIndex];
  const vowelDiscount = !hasVowels(name) ? pf.noVowelDiscount : 1n;
  const nonAlphaDiscount = hasNonAlpha(name) ? pf.nonalphaDiscount : 1n;
  const discount = vowelDiscount > nonAlphaDiscount ? vowelDiscount : nonAlphaDiscount;
  return ((pf.base ** exponent * pf.coeff) / discount) * 10n;
}
