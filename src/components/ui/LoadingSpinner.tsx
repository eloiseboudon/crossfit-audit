import type { HTMLAttributes } from 'react';

export type LoadingSpinnerProps = HTMLAttributes<HTMLDivElement> & {
  size?: number;
};

export function LoadingSpinner({ size = 32, className, ...props }: LoadingSpinnerProps) {
  const classes = ['inline-flex items-center justify-center', className].filter(Boolean).join(' ');
  return (
    <div className={classes} {...props}>
      <div
        className="animate-spin rounded-full border-2 border-[#DAD7CD] border-t-[#48737F]"
        style={{ width: size, height: size }}
      />
    </div>
  );
}
