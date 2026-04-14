import { CopyPathNormalization } from '../../models/copy-path-normalization'

export function normalizePath(path: string): string {
  // Git expects forward slashes, even on Windows.
  // Also trim trailing slashes
  return path.replace(/\\/g, '/').replace(/\/+$/, '')
}

export function convertToCopyPath(
  path: string,
  normalization: CopyPathNormalization
): string {
  switch (normalization) {
    case CopyPathNormalization.Unix:
      return path.replace(/\\/g, '/')
    case CopyPathNormalization.Windows:
      return path.replace(/\//g, '\\')
    case CopyPathNormalization.None:
      return path
  }
}
