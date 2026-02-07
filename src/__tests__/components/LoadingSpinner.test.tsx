import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('affiche le spinner avec la taille par défaut', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('.animate-spin') as HTMLElement;

    expect(spinner).toBeInTheDocument();
    expect(spinner.style.width).toBe('32px');
    expect(spinner.style.height).toBe('32px');
  });

  it('applique une taille personnalisée', () => {
    const { container } = render(<LoadingSpinner size={48} />);
    const spinner = container.querySelector('.animate-spin') as HTMLElement;

    expect(spinner.style.width).toBe('48px');
    expect(spinner.style.height).toBe('48px');
  });

  it('transmet les props HTML', () => {
    const { container } = render(<LoadingSpinner data-testid="loader" className="mt-4" />);
    const wrapper = container.firstElementChild as HTMLElement;

    expect(wrapper).toHaveClass('mt-4');
  });
});
