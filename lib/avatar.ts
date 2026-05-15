export const AVATAR_COLORS = [
  '#E8234A', '#2BB8AA', '#1B2F5E', '#F5C518', '#8B5CF6',
  '#EC4899', '#06B6D4', '#10B981', '#F97316', '#6366F1',
  '#EF4444', '#14B8A6', '#F59E0B', '#3B82F6', '#84CC16', '#D946EF',
];

export function avatarBg(firstName: string, lastName: string): string {
  const a = firstName.charCodeAt(0) || 0;
  const b = lastName.charCodeAt(0) || 0;
  return AVATAR_COLORS[(a * 31 + b) % AVATAR_COLORS.length];
}

export function avatarFg(bg: string): string {
  return ['#F5C518', '#F59E0B', '#84CC16'].includes(bg) ? '#1B2F5E' : '#ffffff';
}
