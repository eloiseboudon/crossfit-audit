import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ErrorMessage } from '../../components/ui/ErrorMessage';

describe('ErrorMessage', () => {
  it('n\'affiche rien sans message', () => {
    const { container } = render(<ErrorMessage message={null} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('affiche le message et le rôle alert', () => {
    render(<ErrorMessage message="Erreur détectée" />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Erreur détectée');
  });
});
