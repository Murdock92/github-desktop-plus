import * as React from 'react'
import { Dialog, DialogContent, DialogFooter } from '../dialog'
import { OkCancelButtonGroup } from '../dialog/ok-cancel-button-group'
import { Ref } from '../lib/ref'
import { Branch } from '../../models/branch'

interface ICantDeleteCurrentBranchUncommittedChangesProps {
  readonly branchToDelete: Branch
  readonly onDismissed: () => void
}

export class CantDeleteCurrentBranchUncommittedChanges extends React.Component<ICantDeleteCurrentBranchUncommittedChangesProps> {
  public render() {
    const { branchToDelete } = this.props
    return (
      <Dialog
        id="cant-delete-current-branch-uncommitted-changes"
        title={__DARWIN__ ? 'Cannot Delete Branch' : 'Cannot delete branch'}
        onSubmit={this.props.onDismissed}
        onDismissed={this.props.onDismissed}
      >
        <DialogContent>
          <p>
            You cannot remove <Ref>{branchToDelete.name}</Ref> because you have
            changes in progress.
          </p>
          <p>You will need to do one of the following:</p>
          <ul>
            <li>Commit your changes.</li>
            <li>Discard all changes.</li>
            <li>Switch to a different branch before removing this one.</li>
          </ul>
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
