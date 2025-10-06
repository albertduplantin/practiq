import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-white dark:bg-gray-900 shadow-sm p-6',
        className
      )}
      {...props}
    />
  );
}
