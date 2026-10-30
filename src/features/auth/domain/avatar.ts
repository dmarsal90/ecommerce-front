export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
export const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/** Error code for an unusable avatar file, or null when it is fine (the API checks it again). */
export function avatarProblem(file: FormDataEntryValue | null | undefined): string | null {
  if (!(file instanceof File) || file.size === 0) return 'file_required';
  if (file.size > AVATAR_MAX_BYTES) return 'file_too_large';
  if (!AVATAR_TYPES.includes(file.type)) return 'file_type';
  return null;
}

/** "Ana Pérez" -> "AP", "madonna" -> "M". */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const letters = words.length > 1 ? [words[0], words[words.length - 1]] : words.slice(0, 1);
  return letters
    .map((word) => Array.from(word)[0])
    .join('')
    .toUpperCase();
}
