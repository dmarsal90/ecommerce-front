import { describe, expect, it } from 'vitest';
import { AVATAR_MAX_BYTES, avatarHue, avatarProblem, initials } from './avatar';

const file = (size: number, type = 'image/png') => new File([new Uint8Array(size)], 'a.png', { type });

describe('avatarProblem', () => {
  it('accepts a small image and rejects missing, empty, huge and non-image files', () => {
    expect(avatarProblem(file(1000))).toBeNull();
    expect(avatarProblem(file(AVATAR_MAX_BYTES))).toBeNull();
    expect(avatarProblem(null)).toBe('file_required');
    expect(avatarProblem(file(0))).toBe('file_required');
    expect(avatarProblem(file(AVATAR_MAX_BYTES + 1))).toBe('file_too_large');
    expect(avatarProblem(file(10, 'image/svg+xml'))).toBe('file_type');
    expect(avatarProblem(file(10, 'application/pdf'))).toBe('file_type');
  });
});

describe('initials', () => {
  it.each([
    ['Ana Pérez', 'AP'],
    ['  madonna ', 'M'],
    ['Jean-Luc de la Cruz', 'JC'],
    ['élodie moreau', 'ÉM'],
    ['', ''],
  ])('%s -> %s', (name, expected) => expect(initials(name)).toBe(expected));
});

describe('avatarHue', () => {
  it('is stable for a name and spreads different names around the colour wheel', () => {
    expect(avatarHue('Ana Pérez')).toBe(avatarHue('Ana Pérez'));
    const hues = new Set(['Ana', 'Luis', 'Marta', 'Jonas', 'Élodie', 'Chen', 'Sofia'].map(avatarHue));
    expect(hues.size).toBeGreaterThan(4);
    expect([...hues].every((h) => h >= 0 && h < 360)).toBe(true);
  });
});
