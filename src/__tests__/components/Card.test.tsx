import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Card } from '../../components/ui/Card';

describe('Card', () => {
  it('affiche le contenu enfant', () => {
    render(<Card>Contenu</Card>);

    expect(screen.getByText('Contenu')).toBeInTheDocument();
  });

  it('applique la variante par défaut', () => {
    const { container } = render(<Card>Test</Card>);
    const div = container.firstElementChild as HTMLElement;

    expect(div).toHaveClass('bg-white', 'rounded-lg', 'p-6');
  });

  it('applique la variante bordered', () => {
    const { container } = render(<Card variant="bordered">Test</Card>);
    const div = container.firstElementChild as HTMLElement;

    expect(div).toHaveClass('bg-white', 'rounded-lg', 'p-6');
    expect(div.className).toContain('border-2');
  });

  it('applique la variante elevated', () => {
    const { container } = render(<Card variant="elevated">Test</Card>);
    const div = container.firstElementChild as HTMLElement;

    expect(div).toHaveClass('bg-white', 'rounded-lg', 'shadow-lg', 'p-6');
  });

  it('transmet les props HTML supplémentaires', () => {
    render(<Card data-testid="my-card">Test</Card>);

    expect(screen.getByTestId('my-card')).toBeInTheDocument();
  });

  it('ajoute les classes CSS personnalisées', () => {
    const { container } = render(<Card className="mt-4">Test</Card>);
    const div = container.firstElementChild as HTMLElement;

    expect(div).toHaveClass('mt-4');
  });
});
