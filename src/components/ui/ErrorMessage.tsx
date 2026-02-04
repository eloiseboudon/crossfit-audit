import type { HTMLAttributes } from 'react';

export type ErrorMessageProps = HTMLAttributes<HTMLDivElement> & {
  message?: string | null;
};

export function ErrorMessage({ message, className, ...props }: ErrorMessageProps) {
  if (!message) {
    return null;
  }

  const classes = [
    'rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} role="alert" {...props}>
      {message}
    </div>
  );
}
