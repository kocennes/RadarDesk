export function formatDisplayTime(value: string): string {
  const trimmedValue = value.trim()

  if (trimmedValue.length === 0) {
    return 'Bilinmeyen zaman'
  }

  return trimmedValue
}
