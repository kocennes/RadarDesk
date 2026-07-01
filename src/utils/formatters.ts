export function formatDisplayTime(value: string): string {
  const trimmedValue = value.trim()

  if (trimmedValue.length === 0) {
    return 'Unknown time'
  }

  return trimmedValue
}
