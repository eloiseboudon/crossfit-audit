import type { HTMLAttributes, PropsWithChildren } from 'react';

export type CardProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>>;

export function Card({ className, ...props }: CardProps) {
  const classes = [
    'rounded-xl border border-[#DAD7CD] bg-white p-6 shadow-sm',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={classes} {...props} />;
}
