import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  const classes = [
    'w-full rounded-lg border border-[#DAD7CD] bg-white px-3 py-2 text-sm text-[#48737F] placeholder:text-[#CCBB90]/70 focus:border-[#48737F] focus:outline-none focus:ring-2 focus:ring-[#48737F]/20',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <input ref={ref} className={classes} {...props} />;
});

Input.displayName = 'Input';
