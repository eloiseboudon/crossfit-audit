import { forwardRef, type HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered' | 'elevated';
}

/**
 * Composant Card réutilisable pour afficher du contenu encapsulé.
 *
 * @example
 * <Card variant="elevated">
 *   <h3>Titre</h3>
 *   <p>Contenu</p>
 * </Card>
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', className = '', children, ...props }, ref) => {
    const variantClasses: Record<string, string> = {
      default: 'bg-white rounded-lg p-6',
      bordered: 'bg-white border-2 border-[#DAD7CD] rounded-lg p-6',
      elevated: 'bg-white rounded-lg shadow-lg p-6',
    };

    const classes = [variantClasses[variant], className].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';
