import { normalizePath } from './helpers/path'

const StorageKey = 'worktree-active-paths'

function getPreferences(): Record<string, string> {
  try {
    const raw = localStorage.getItem(StorageKey)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function savePreferences(prefs: Record<string, string>) {
  localStorage.setItem(StorageKey, JSON.stringify(prefs))
}

/**
 * Get the preferred worktree path for a given main worktree path.
 * Returns null if no preference is stored (defaults to main worktree).
 */
export function getPreferredWorktreePath(
  mainWorktreePath: string
): string | null {
  const prefs = getPreferences()
  return prefs[normalizePath(mainWorktreePath)] ?? null
}

/**
 * Store the user's active worktree choice for a repository.
 * If the active path is the main worktree itself, the preference is cleared
 * so the repo defaults to its main worktree on next visit.
 */
export function setPreferredWorktreePath(
  mainWorktreePath: string,
  activeWorktreePath: string
) {
  const prefs = getPreferences()
  const normalizedMain = normalizePath(mainWorktreePath)
  const normalizedActive = normalizePath(activeWorktreePath)

  if (normalizedMain === normalizedActive) {
    delete prefs[normalizedMain]
  } else {
    prefs[normalizedMain] = normalizedActive
  }

  savePreferences(prefs)
}

/**
 * Clear any stored worktree preference for a repository so it
 * defaults to the main worktree on next visit.
 */
export function clearPreferredWorktreePath(mainWorktreePath: string) {
  const prefs = getPreferences()
  delete prefs[normalizePath(mainWorktreePath)]
  savePreferences(prefs)
}
