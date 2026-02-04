import { describe, expect, it } from 'vitest';
import { getAnswerValue } from '../../lib/extractData';
import type { Answer } from '../../lib/types';

describe('getAnswerValue', () => {
  it('retourne la valeur de la réponse correspondante', () => {
    const answers: Answer[] = [
      { id: '1', audit_id: 'a1', block_code: 'finance', question_code: 'q1', value: 10 }
    ];

    expect(getAnswerValue(answers, 'finance', 'q1')).toBe(10);
  });

  it('retourne la valeur par défaut si non trouvée', () => {
    const answers: Answer[] = [];

    expect(getAnswerValue(answers, 'finance', 'q1', 42)).toBe(42);
  });
});
