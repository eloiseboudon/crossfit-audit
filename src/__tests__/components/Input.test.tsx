import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Input } from '../../components/ui/Input';

describe('Input', () => {
  it('affiche le label quand il est fourni', () => {
    render(<Input label="Email" />);

    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('n\'affiche pas de label quand il est absent', () => {
    const { container } = render(<Input />);

    expect(container.querySelector('label')).toBeNull();
  });

  it('affiche le message d\'erreur', () => {
    render(<Input error="Champ requis" />);

    expect(screen.getByText('Champ requis')).toBeInTheDocument();
  });

  it('applique les classes d\'erreur sur l\'input', () => {
    render(<Input error="Erreur" data-testid="input" />);
    const input = screen.getByTestId('input');

    expect(input.className).toContain('border-red-300');
  });

  it('affiche le texte d\'aide quand il n\'y a pas d\'erreur', () => {
    render(<Input helpText="Aide contextuelle" />);

    expect(screen.getByText('Aide contextuelle')).toBeInTheDocument();
  });

  it('masque le texte d\'aide quand il y a une erreur', () => {
    render(<Input helpText="Aide" error="Erreur" />);

    expect(screen.queryByText('Aide')).not.toBeInTheDocument();
    expect(screen.getByText('Erreur')).toBeInTheDocument();
  });

  it('gère la saisie utilisateur', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<Input onChange={onChange} data-testid="input" />);

    await user.type(screen.getByTestId('input'), 'hello');

    expect(onChange).toHaveBeenCalled();
  });

  it('transmet les props HTML', () => {
    render(<Input placeholder="Votre email" type="email" data-testid="input" />);
    const input = screen.getByTestId('input');

    expect(input).toHaveAttribute('placeholder', 'Votre email');
    expect(input).toHaveAttribute('type', 'email');
  });
});
