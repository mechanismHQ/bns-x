import { cn } from '@common/ui-utils';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-slate-100 dark:bg-text-subdued', className)}
      {...props}
    />
  );
}

export { Skeleton };
