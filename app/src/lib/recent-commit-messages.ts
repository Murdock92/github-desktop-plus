const StorageKey = 'recent-commit-messages-v1'
const MaxEntries = 50

/**
 * Regex matching an issue/ticket number at the start of a commit summary.
 * Format: 3 uppercase letters, hyphen, one or more digits, colon.
 * e.g. "ABC-123: fix the thing"
 */
const IssueNumberRegex = /^([A-Z]{3}-\d+):/

/** Extract issue number from the start of a commit summary, or null. */
export function extractIssueNumber(summary: string): string | null {
  const match = IssueNumberRegex.exec(summary)
  return match !== null ? match[1] : null
}

/** A locally-persisted commit message entry. */
export interface IRecentCommitMessage {
  readonly summary: string
  readonly description: string | null
}

/** Load recent commit messages from localStorage. */
export function loadRecentCommitMessages(): ReadonlyArray<IRecentCommitMessage> {
  try {
    const raw = localStorage.getItem(StorageKey)
    if (raw === null) {
      return []
    }
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed.filter(
      (item): item is IRecentCommitMessage =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as Record<string, unknown>).summary === 'string' &&
        ((item as Record<string, unknown>).description === null ||
          typeof (item as Record<string, unknown>).description === 'string')
    )
  } catch {
    return []
  }
}

/**
 * Prepend a new commit message to the locally-persisted history.
 * Deduplicates by summary and caps at MaxEntries.
 */
export function saveRecentCommitMessage(
  summary: string,
  description: string | null
): void {
  const existing = loadRecentCommitMessages().filter(m => m.summary !== summary)
  const updated = [{ summary, description }, ...existing].slice(0, MaxEntries)
  try {
    localStorage.setItem(StorageKey, JSON.stringify(updated))
  } catch {
    // localStorage may not be available in all environments — fail silently
  }
}
