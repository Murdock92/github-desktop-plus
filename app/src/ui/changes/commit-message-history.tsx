import * as React from 'react'
import {
  IRecentCommitMessage,
  extractIssueNumber,
} from '../../lib/recent-commit-messages'
import {
  Popover,
  PopoverAnchorPosition,
  PopoverDecoration,
} from '../lib/popover'
import { Button } from '../lib/button'
import { Octicon } from '../octicons'
import * as octicons from '../octicons/octicons.generated'

interface ICommitMessageHistoryProps {
  /** The anchor element to position the popover against */
  readonly anchor: HTMLElement | null

  /** Recent commit messages to display, newest first */
  readonly recentMessages: ReadonlyArray<IRecentCommitMessage>

  /** Called when the user selects a commit message to use */
  readonly onSelectMessage: (
    summary: string,
    description: string | null
  ) => void

  /** Called when the popover should be dismissed */
  readonly onDismiss: () => void
}

interface ICommitMessageHistoryState {
  readonly copiedIssue: string | null
}

/** Dropdown popover showing recent commit messages for quick reuse. */
export class CommitMessageHistory extends React.Component<
  ICommitMessageHistoryProps,
  ICommitMessageHistoryState
> {
  private copyResetTimeout: number | null = null

  public constructor(props: ICommitMessageHistoryProps) {
    super(props)
    this.state = { copiedIssue: null }
  }

  public componentWillUnmount() {
    if (this.copyResetTimeout !== null) {
      window.clearTimeout(this.copyResetTimeout)
    }
  }

  private onSelectEntry = (entry: IRecentCommitMessage) => {
    this.props.onSelectMessage(entry.summary, entry.description)
    this.props.onDismiss()
  }

  private onCopyIssueNumber = (
    e: React.MouseEvent<HTMLButtonElement>,
    issueNumber: string
  ) => {
    e.stopPropagation()
    navigator.clipboard.writeText(issueNumber).catch(() => {
      // Fallback for environments without clipboard API
      const el = document.createElement('textarea')
      el.value = issueNumber
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    })

    this.setState({ copiedIssue: issueNumber })

    if (this.copyResetTimeout !== null) {
      window.clearTimeout(this.copyResetTimeout)
    }
    this.copyResetTimeout = window.setTimeout(() => {
      this.setState({ copiedIssue: null })
      this.copyResetTimeout = null
    }, 2000)
  }

  private renderEntry(entry: IRecentCommitMessage, index: number): JSX.Element {
    const issueNumber = extractIssueNumber(entry.summary)
    const isCopied = this.state.copiedIssue === issueNumber

    return (
      <div
        key={index}
        className="commit-message-history-item"
        onClick={() => this.onSelectEntry(entry)}
        role="option"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            this.onSelectEntry(entry)
          }
        }}
      >
        <div className="commit-message-history-item-content">
          <span className="commit-message-history-summary">
            {entry.summary}
          </span>
          {entry.description && (
            <span className="commit-message-history-body">
              {entry.description}
            </span>
          )}
        </div>
        {issueNumber !== null && (
          <Button
            className="commit-message-history-copy-btn"
            onClick={e => this.onCopyIssueNumber(e, issueNumber)}
            tooltip={
              isCopied ? 'Copied!' : `Copy issue number (${issueNumber})`
            }
            ariaLabel={
              isCopied ? 'Copied!' : `Copy issue number ${issueNumber}`
            }
          >
            <Octicon symbol={isCopied ? octicons.check : octicons.copy} />
            <span className="commit-message-history-issue-label">
              {issueNumber}
            </span>
          </Button>
        )}
      </div>
    )
  }

  public render() {
    const { anchor, recentMessages, onDismiss } = this.props

    if (recentMessages.length === 0) {
      return null
    }

    return (
      <Popover
        anchor={anchor}
        anchorPosition={PopoverAnchorPosition.BottomLeft}
        decoration={PopoverDecoration.Balloon}
        onClickOutside={onDismiss}
        maxHeight={320}
        minHeight={80}
      >
        <div className="commit-message-history-popover">
          <div className="commit-message-history-header">
            <span>Recent commit messages</span>
            <Button
              className="commit-message-history-close"
              onClick={onDismiss}
              ariaLabel="Close commit message history"
            >
              <Octicon symbol={octicons.x} />
            </Button>
          </div>
          <div
            className="commit-message-history-list"
            role="listbox"
            aria-label="Recent commit messages"
          >
            {recentMessages.map((m, i) => this.renderEntry(m, i))}
          </div>
        </div>
      </Popover>
    )
  }
}
