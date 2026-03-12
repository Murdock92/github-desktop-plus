GitHub Desktop Plus v3.5.7-beta2

Upstream: [GitHub Desktop v3.5.7-beta2 release notes](https://github.com/desktop/desktop/releases/tag/release-3.5.7-beta2)

---

## **Changes and improvements:**

- Solved merge conflicts are now automatically staged when switching branches. This avoids the error message "you need to resolve your current index first" when trying to switch branches after solving merge conflicts.

- Improved the error message when trying to remove the currently checked out branch but the main branch is in use by another worktree.


## **Fixes:**

- The Winget package now uses the correct Windows app version. This should fix the issue where Winget is constantly trying to update GitHub Desktop Plus to the same version.

- Updated to a newer Electron version, which might fix some rendering issues related to screen brightness.
