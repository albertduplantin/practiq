'use client';

import { cva, VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { ButtonHTMLAttributes, forwardRef } from 'react';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white hover:bg-primary-dark focus-visible:ring-primary',
        outline: 'border border-primary text-primary hover:bg-primary/10 focus-visible:ring-primary',
      },
      size: {
        sm: 'h-8 px-3',
        md: 'h-10 px-4',
        lg: 'h-12 px-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => {
  return (
    <button ref={ref} className={twMerge(buttonVariants({ variant, size }), className)} {...props} />
  );
});
Button.displayName = 'Button';

export { Button, buttonVariants };
