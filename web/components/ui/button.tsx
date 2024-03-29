import * as React from 'react';
import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

import { cn } from '@common/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 dark:hover:bg-surface-surface-hovered dark:hover:text-neutral-900 disabled:opacity-50 dark:focus:ring-slate-400 disabled:pointer-events-none dark:focus:ring-offset-slate-900 data-[state=open]:bg-slate-100 dark:data-[state=open]:bg-surface-surface-hovered',
  {
    variants: {
      variant: {
        default: 'bg-white text-neutral-900 border border-white dark:hover:bg-white/90',
        destructive: 'bg-red-500 text-white hover:bg-red-600 dark:hover:bg-red-600',
        outline:
          'bg-transparent border border-slate-200 hover:bg-slate-100 dark:border-border dark:text-slate-100 dark:hover:text-slate-100/90 dark:hover:bg-surface-surface-hovered dark:data-[state=open]:bg-surface-surface-pressed',
        subtle:
          'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-100',
        ghost:
          'bg-transparent hover:bg-slate-100 dark:hover:bg-surface-surface-hovered dark:text-slate-100 dark:hover:text-slate-100 data-[state=open]:bg-transparent dark:data-[state=open]:bg-transparent',
        link: 'bg-transparent dark:bg-transparent underline-offset-4 hover:underline text-slate-900 dark:text-slate-100 hover:bg-transparent dark:hover:bg-transparent',
        secondary:
          'border border-border dark:bg-surface-surface dark:text-text dark:hover:bg-surface-surface-hovered dark:hover:text-text',
        tertiary:
          'dark:text-text dark:bg-dark-primary-action-subdued dark:hover:bg-[#2c2c2c] dark:hover:text-text',
      },
      status: {
        pending: 'dark:!border-indigo-800',
        success: 'dark:!border-emerald-800',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-2',
        lg: 'h-11 px-8',
        xl: 'h-12 px-10',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, status, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className, status }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
