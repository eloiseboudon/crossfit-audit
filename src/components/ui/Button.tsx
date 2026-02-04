import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const baseClasses =
  'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#48737F]/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60';

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-[#48737F] text-[#DAD7CD] hover:bg-[#3A5C66]',
  secondary: 'bg-[#DAD7CD] text-[#48737F] hover:bg-[#C9C5B7]',
  accent: 'bg-[#CCBB90] text-[#48737F] hover:bg-[#B8A780]',
  ghost: 'bg-transparent text-[#48737F] hover:bg-[#48737F]/10',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', ...props }, ref) => {
    const classes = [baseClasses, variantClasses[variant], className].filter(Boolean).join(' ');
    return <button ref={ref} className={classes} {...props} />;
  },
);

Button.displayName = 'Button';
