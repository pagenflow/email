export default function isGapZero(gap?: string): boolean {
  if (!gap) return true;
  // Remove whitespace and convert to lowercase
  const trimmedGap = gap.trim().toLowerCase();
  // Check for exact zero matches (0, 0px, 0%, 0em, 0rem, etc.)
  return /^0(px|%|em|rem|ex|ch|vw|vh|vmin|vmax)?$/.test(trimmedGap);
}