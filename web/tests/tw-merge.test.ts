import { test, expect } from 'vitest';
import { twMerge } from '../common/ui-utils';

test('tailwind merge with custom colors', () => {
  const textStyles = 'text-text text-body01';
  const merged = twMerge(textStyles);
  expect(merged).toEqual(textStyles);
});

test('merges with normal font sizes', () => {
  const textStyles = 'text-text text-sm';
  const merged = twMerge(textStyles);
  expect(merged).toEqual(textStyles);
});
