import type { HTMLAttributes } from 'react';
import { COLOR_CLASSES } from '../../lib/constants';

export type LoadingSpinnerProps = HTMLAttributes<HTMLDivElement> & {
  size?: number;
};

export function LoadingSpinner({ size = 32, className, ...props }: LoadingSpinnerProps) {
  const classes = ['inline-flex items-center justify-center', className].filter(Boolean).join(' ');
  return (
    <div className={classes} {...props}>
      <div
        className={`animate-spin rounded-full border-2 ${COLOR_CLASSES.borderNeutral} ${COLOR_CLASSES.borderTopPrimary}`}
        style={{ width: size, height: size }}
      />
    </div>
  );
}
