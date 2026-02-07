import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { COLOR_CLASSES } from '../../lib/constants';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

/**
 * Composant Button réutilisable avec variants de style.
 *
 * @example
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Enregistrer
 * </Button>
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    isLoading,
    children,
    className = '',
    disabled,
    ...props
  }, ref) => {
    const baseClasses =
      'inline-flex items-center justify-center font-semibold rounded-lg transition-all ' +
      'focus:outline-none focus:ring-2 focus:ring-offset-2 ' +
      'disabled:opacity-50 disabled:cursor-not-allowed';

    const variantClasses: Record<ButtonVariant, string> = {
      primary: `${COLOR_CLASSES.bgPrimary} text-white ${COLOR_CLASSES.hoverBgPrimaryDarker} ${COLOR_CLASSES.focusRingPrimary}`,
      secondary: `${COLOR_CLASSES.bgSecondary} ${COLOR_CLASSES.textPrimary} ${COLOR_CLASSES.hoverBgSecondaryDark} ${COLOR_CLASSES.focusRingSecondary}`,
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600',
      ghost: `bg-transparent ${COLOR_CLASSES.textPrimary} ${COLOR_CLASSES.hoverBgPrimary10} ${COLOR_CLASSES.focusRingPrimary}`,
    };

    const sizeClasses: Record<ButtonSize, string> = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    const classes = [baseClasses, variantClasses[variant], sizeClasses[size], className]
      .filter(Boolean)
      .join(' ');

    return (
      <button ref={ref} className={classes} disabled={disabled || isLoading} {...props}>
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
