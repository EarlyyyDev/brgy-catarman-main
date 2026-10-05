/** Applies an admin-picked brand color across every CSS custom property that
 * visually depends on it. Previously only --primary/--ring/--sidebar-accent
 * (or --gold/--sidebar-primary) were updated, leaving foreground/text colors,
 * the sidebar background, avatar initials, and muted/tint variants stuck at
 * the original navy/gold values -- which is what made the picked color look
 * mismatched and "messy" throughout the dashboard instead of professional. */

function hexToRgb(hex: string): [number, number, number] | null {
  const clean = hex.trim().replace("#", "")
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null
  const num = parseInt(full, 16)
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

function contrastRatio(luminanceA: number, luminanceB: number): number {
  const lighter = Math.max(luminanceA, luminanceB)
  const darker = Math.min(luminanceA, luminanceB)
  return (lighter + 0.05) / (darker + 0.05)
}

/** Picks whichever of near-white or near-black reads better on the given
 * background color, so text/icons placed on an admin-picked color are never
 * accidentally invisible. */
function contrastColor(hex: string, dark = "#0a1930", light = "#ffffff"): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return light
  const luminance = relativeLuminance(rgb)
  const lightRatio = contrastRatio(luminance, 1)
  const darkRatio = contrastRatio(luminance, 0)
  return lightRatio >= darkRatio ? light : dark
}

function setVar(name: string, value: string) {
  document.documentElement.style.setProperty(name, value)
}

export function applyPrimaryColor(primary: string) {
  const foreground = contrastColor(primary)
  setVar("--primary", primary)
  setVar("--primary-foreground", foreground)
  setVar("--ring", primary)
  setVar("--secondary-foreground", primary)
  setVar("--navy", primary)
  setVar("--navy-foreground", foreground)
  setVar("--sidebar", primary)
  setVar("--sidebar-foreground", foreground)
  setVar("--sidebar-accent", primary)
  setVar("--chart-1", primary)
}

export function applyAccentColor(accent: string) {
  const foreground = contrastColor(accent)
  const mutedTint = `color-mix(in srgb, ${accent} 18%, white)`
  setVar("--gold", accent)
  setVar("--gold-foreground", foreground)
  setVar("--gold-muted", mutedTint)
  setVar("--accent", mutedTint)
  setVar("--accent-foreground", foreground)
  setVar("--sidebar-primary", accent)
  setVar("--sidebar-primary-foreground", foreground)
  setVar("--sidebar-ring", accent)
  setVar("--chart-2", accent)
}
