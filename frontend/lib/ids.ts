let counter = 0

/** Local-only id for tracking not-yet-uploaded file previews in component state. */
export function generateId(prefix: string): string {
  counter += 1
  const random = Math.random().toString(36).slice(2, 8)
  return `${prefix}-${Date.now().toString(36)}${counter}${random}`
}
