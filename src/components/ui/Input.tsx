import { forwardRef, type InputHTMLAttributes } from 'react';

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
      error ? 'border-red-300 focus:ring-red-500' : 'border-[#DAD7CD] focus:ring-[#48737F]',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className="space-y-1">
        {label && <label className="block text-sm font-medium text-[#48737F]">{label}</label>}
        <input ref={ref} className={inputClasses} {...props} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {helpText && !error && <p className="text-sm text-[#48737F]/60">{helpText}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
