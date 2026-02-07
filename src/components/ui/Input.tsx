import { forwardRef, type InputHTMLAttributes } from 'react';
import { COLOR_CLASSES } from '../../lib/constants';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

/**
 * Composant Input avec label et gestion d'erreurs.
 *
 * @example
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="votre@email.com"
 *   error={errors.email}
 * />
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helpText, className = '', ...props }, ref) => {
    const inputClasses = [
      'w-full px-4 py-2 border rounded-lg transition-all',
      'focus:outline-none focus:ring-2',
      error ? 'border-red-300 focus:ring-red-500' : `${COLOR_CLASSES.borderNeutral} ${COLOR_CLASSES.focusRingPrimary}`,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className="space-y-1">
        {label && <label className={`block text-sm font-medium ${COLOR_CLASSES.textPrimary}`}>{label}</label>}
        <input ref={ref} className={inputClasses} {...props} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {helpText && !error && <p className={`text-sm ${COLOR_CLASSES.textPrimary60}`}>{helpText}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
