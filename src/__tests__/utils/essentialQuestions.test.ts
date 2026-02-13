import { describe, expect, it } from 'vitest';
import {
  essentialQuestionSections,
  essentialQuestionItems,
} from '../../lib/essentialQuestions';

describe('essentialQuestionSections', () => {
  it('contains 5 sections', () => {
    expect(essentialQuestionSections).toHaveLength(5);
  });

  it('every section has a title and non-empty items', () => {
    for (const section of essentialQuestionSections) {
      expect(section.title).toBeTruthy();
      expect(section.items.length).toBeGreaterThan(0);
    }
  });

  it('every item has a block and a label', () => {
    for (const item of essentialQuestionItems) {
      expect(item.block).toBeTruthy();
      expect(item.label).toBeTruthy();
    }
  });

  it('every item has either code or codes (not both empty)', () => {
    for (const item of essentialQuestionItems) {
      const hasCode = typeof item.code === 'string' && item.code.length > 0;
      const hasCodes = Array.isArray(item.codes) && item.codes.length > 0;
      expect(hasCode || hasCodes).toBe(true);
    }
  });

  it('no duplicate code across items', () => {
    const allCodes: string[] = [];
    for (const item of essentialQuestionItems) {
      if (item.code) allCodes.push(`${item.block}:${item.code}`);
      if (item.codes) {
        for (const c of item.codes) allCodes.push(`${item.block}:${c}`);
      }
    }
    const unique = new Set(allCodes);
    expect(unique.size).toBe(allCodes.length);
  });
});

describe('essentialQuestionItems', () => {
  it('is the flat list of all section items', () => {
    const expected = essentialQuestionSections.flatMap((s) => s.items);
    expect(essentialQuestionItems).toEqual(expected);
  });

  it('contains 25 items total', () => {
    expect(essentialQuestionItems.length).toBe(25);
  });
});
