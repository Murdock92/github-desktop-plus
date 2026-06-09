const StorageKeyPrefix = 'repo-accent-color-'

/** Named preset colors available for repo accent. */
export const AccentColorPresets = [
  { label: 'Red', value: '#e74c3c' },
  { label: 'Orange', value: '#e67e22' },
  { label: 'Yellow', value: '#f1c40f' },
  { label: 'Green', value: '#2ecc71' },
  { label: 'Teal', value: '#1abc9c' },
  { label: 'Blue', value: '#3498db' },
  { label: 'Purple', value: '#9b59b6' },
  { label: 'Pink', value: '#e91e63' },
] as const

export type AccentColorPreset = (typeof AccentColorPresets)[number]['value']

/** Return the accent color for a repository, or null if none is set. */
export function getRepoAccentColor(repoId: number): string | null {
  try {
    return localStorage.getItem(`${StorageKeyPrefix}${repoId}`)
  } catch {
    return null
  }
}

/** Set or clear the accent color for a repository. */
export function setRepoAccentColor(
  repoId: number,
  color: string | null
): void {
  try {
    if (color === null) {
      localStorage.removeItem(`${StorageKeyPrefix}${repoId}`)
    } else {
      localStorage.setItem(`${StorageKeyPrefix}${repoId}`, color)
    }
  } catch {
    // localStorage unavailable — fail silently
  }
}

/** Load all stored accent colors as a Map<repoId, color>. */
export function getAllRepoAccentColors(): ReadonlyMap<number, string> {
  const result = new Map<number, string>()
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key !== null && key.startsWith(StorageKeyPrefix)) {
        const id = parseInt(key.slice(StorageKeyPrefix.length), 10)
        if (!isNaN(id)) {
          const value = localStorage.getItem(key)
          if (value !== null) {
            result.set(id, value)
          }
        }
      }
    }
  } catch {
    // localStorage unavailable
  }
  return result
}
