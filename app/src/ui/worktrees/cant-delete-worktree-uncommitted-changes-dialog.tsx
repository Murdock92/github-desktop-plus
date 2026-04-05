import * as React from 'react'
import * as Path from 'path'
import { Dialog, DialogContent, DialogFooter } from '../dialog'
import { OkCancelButtonGroup } from '../dialog/ok-cancel-button-group'
import { Ref } from '../lib/ref'

interface ICantDeleteWorktreeUncommittedChangesProps {
  readonly worktreePath: string
  readonly onDismissed: () => void
}

export class CantDeleteWorktreeUncommittedChanges extends React.Component<ICantDeleteWorktreeUncommittedChangesProps> {
  public render() {
    const name = Path.basename(this.props.worktreePath)
    return (
      <Dialog
        id="cant-delete-worktree-uncommitted-changes"
        title={__DARWIN__ ? 'Cannot Delete Worktree' : 'Cannot delete worktree'}
        onSubmit={this.props.onDismissed}
        onDismissed={this.props.onDismissed}
      >
        <DialogContent>
          <p>
            You cannot remove <Ref>{name}</Ref> because it has changes in
            progress.
          </p>
          <p>
            You need to commit or discard your changes before you can delete the
            worktree.
          </p>
        </DialogContent>
        <DialogFooter>
          <OkCancelButtonGroup
            okButtonText="Close"
            cancelButtonVisible={false}
          />
        </DialogFooter>
      </Dialog>
    )
  }
}
