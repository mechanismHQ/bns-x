import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

export const twMerge = extendTailwindMerge({
  classGroups: {
    'font-size': [
      {
        text: [
          'body01',
          'body02',
          'heading01',
          'heading02',
          'heading022',
          'heading03',
          'heading035',
          'heading04',
          'heading05',
          'heading06',
          'display01',
          'display02',
          'caption01',
          'caption02',
        ],
      },
    ],
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
