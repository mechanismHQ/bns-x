import * as React from 'react';
import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import { cn } from '@common/utils';

const textVariants = cva('!text-text block', {
  variants: {
    variant: {
      Body01: 'text-body01',
      Body02: 'text-body02',
      Caption01: '!text-text-subdued text-caption01',
      Caption02: '!text-text-subdued text-caption02',
      Heading01: 'text-heading01',
      Heading02: 'text-heading02',
      Heading03: 'text-heading03',
      Heading035: 'text-heading035',
      Heading04: 'text-heading04',
      Heading05: 'text-heading05',
      Heading06: 'text-heading06',
      Heading022: 'text-heading022',
      Display01: 'text-display01',
      Display02: 'text-display02',
    },
  },
  defaultVariants: {
    variant: 'Body01',
  },
});

export interface TextProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof textVariants> {}

const Text = React.forwardRef<HTMLSpanElement, TextProps>(
  ({ className, variant, ...props }, ref) => {
    return <span className={cn(textVariants({ variant, className }))} ref={ref} {...props} />;
  }
);
Text.displayName = 'Text';

export { Text, textVariants };
