import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '../../components/ui/Button';

describe('Button', () => {
  it('affiche le libellé et gère le clic', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(
      <Button onClick={onClick}>
        Envoyer
      </Button>
    );

    const button = screen.getByRole('button', { name: 'Envoyer' });
    await user.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('applique la variante', () => {
    render(<Button variant="ghost">Ghost</Button>);
    const button = screen.getByRole('button', { name: 'Ghost' });

    expect(button).toHaveClass('bg-transparent');
  });
});
