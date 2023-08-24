import * as React from 'react';
import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import { cn } from '@common/utils';

const textVariants = cva('text-text block font-inter', {
  variants: {
    variant: {
      Body01: 'text-body01',
      Body02: 'text-body02',
      Caption01: 'text-text-subdued text-caption01',
      Caption02: 'text-text-subdued text-caption02',
      Heading01: 'text-heading01 font-open-sauce',
      Heading02: 'text-heading02 font-open-sauce',
      Heading03: 'text-heading03 font-open-sauce',
      Heading035: 'text-heading035 font-open-sauce',
      Heading04: 'text-heading04 font-open-sauce',
      Heading05: 'text-heading05 font-open-sauce',
      Heading06: 'text-heading06 font-open-sauce',
      Heading022: 'text-heading022 font-open-sauce',
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
