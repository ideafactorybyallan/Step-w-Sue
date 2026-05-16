// Curated avatar palette — 6 hand-picked combos derived from the brand colors.
// Stable per participant: a simple hash of (firstName + lastName) selects a combo,
// so each person always gets the same avatar.

type Combo = readonly [bg: string, fg: string];

const COMBOS: readonly Combo[] = [
  ['#1B2F5E', '#FFF7ED'],   // navy / cream — primary
  ['#E8234A', '#FFF7ED'],   // pink / cream
  ['#2BB8AA', '#FFF7ED'],   // teal / cream
  ['#F5C518', '#1B2F5E'],   // gold / navy — high-contrast inverse
  ['#101B3D', '#FFD84D'],   // dark navy / light gold
  ['#1A9B8E', '#FFE066'],   // deep teal / pale gold
];

// Legacy export so existing code paths still resolve (used in a few spots).
export const AVATAR_COLORS = COMBOS.map(([bg]) => bg);

function hash(firstName: string, lastName: string): number {
  const a = firstName.charCodeAt(0) || 0;
  const b = lastName.charCodeAt(0) || 0;
  return (a * 31 + b) % COMBOS.length;
}

export function avatarBg(firstName: string, lastName: string): string {
  return COMBOS[hash(firstName, lastName)][0];
}

export function avatarFg(bg: string): string {
  // Look the combo up by background so callers that only have `bg` still
  // get the matching foreground from the curated palette.
  const combo = COMBOS.find(([b]) => b === bg);
  return combo ? combo[1] : '#FFF7ED';
}
