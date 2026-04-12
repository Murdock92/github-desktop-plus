import { assertNever } from '../lib/fatal-error'

export enum DiffFontFamily {
  Default = 'default',
  CascadiaMono = 'cascadia-mono',
  Consolas = 'consolas',
  FiraCode = 'fira-code',
  JetBrainsMono = 'jetbrains-mono',
  CourierNew = 'courier-new',
}

export const defaultDiffFontFamily = DiffFontFamily.Default
export const defaultDiffFontSize = 11

export const availableDiffFontSizes: ReadonlyArray<number> = [
  10, 11, 12, 13, 14, 16,
]

export function getDiffFontFamilyLabel(fontFamily: DiffFontFamily) {
  switch (fontFamily) {
    case DiffFontFamily.Default:
      return 'Default monospace'
    case DiffFontFamily.CascadiaMono:
      return 'Cascadia Mono'
    case DiffFontFamily.Consolas:
      return 'Consolas'
    case DiffFontFamily.FiraCode:
      return 'Fira Code'
    case DiffFontFamily.JetBrainsMono:
      return 'JetBrains Mono'
    case DiffFontFamily.CourierNew:
      return 'Courier New'
    default:
      return assertNever(fontFamily, `Unknown diff font family: ${fontFamily}`)
  }
}

export function getDiffFontFamilyCssValue(fontFamily: DiffFontFamily) {
  switch (fontFamily) {
    case DiffFontFamily.Default:
      return 'var(--font-family-monospace)'
    case DiffFontFamily.CascadiaMono:
      return '"Cascadia Mono", "Cascadia Code", var(--font-family-monospace)'
    case DiffFontFamily.Consolas:
      return 'Consolas, "Lucida Console", var(--font-family-monospace)'
    case DiffFontFamily.FiraCode:
      return '"Fira Code", var(--font-family-monospace)'
    case DiffFontFamily.JetBrainsMono:
      return '"JetBrains Mono", var(--font-family-monospace)'
    case DiffFontFamily.CourierNew:
      return '"Courier New", Courier, var(--font-family-monospace)'
    default:
      return assertNever(fontFamily, `Unknown diff font family: ${fontFamily}`)
  }
}

export function getDiffLineHeight(diffFontSize: number) {
  return Math.max(20, diffFontSize + 8)
}
