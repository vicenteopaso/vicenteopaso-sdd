/**
 * Colour theme (light/dark) via next-themes; see app/components/ThemeProvider.tsx.
 *
 * Visitors land on their OS theme (`prefers-color-scheme`). The nav toggle is
 * binary: it flips to the opposite of what is showing. When that opposite is
 * the OS theme, the stored override is cleared ("system") instead, so the
 * site goes back to following the OS rather than pinning a copy of it.
 */

export type ThemeChoice = "light" | "dark" | "system";

export function nextThemeChoice(
  resolvedTheme: string | undefined,
  systemTheme: string | undefined,
): ThemeChoice {
  const next = resolvedTheme === "light" ? "dark" : "light";
  return next === systemTheme ? "system" : next;
}
