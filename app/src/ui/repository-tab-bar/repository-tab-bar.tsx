import * as React from 'react'
import { Repository } from '../../models/repository'
import { CloningRepository } from '../../models/cloning-repository'
import { Dispatcher } from '../dispatcher'
import { Octicon } from '../octicons'
import { iconForRepository } from '../octicons'
import * as octicons from '../octicons/octicons.generated'

interface IRepositoryTabBarProps {
  /** The ordered list of repositories open in tabs */
  readonly openTabs: ReadonlyArray<Repository | CloningRepository>

  /** The currently active repository, or null */
  readonly selectedRepository: Repository | CloningRepository | null

  readonly dispatcher: Dispatcher
}

/**
 * A horizontal tab bar showing one tab per open repository. Clicking a tab
 * switches to that repository; clicking the × button closes the tab.
 * Middle-clicking a tab also closes it.
 *
 * The bar is hidden when fewer than two tabs are open so as not to waste
 * screen real estate for single-repo workflows.
 */
export class RepositoryTabBar extends React.Component<
  IRepositoryTabBarProps,
  {}
> {
  private onTabClick = (repository: Repository | CloningRepository) => {
    this.props.dispatcher.selectRepository(repository)
  }

  private onCloseClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    repository: Repository | CloningRepository
  ) => {
    // Prevent the parent tab button from also firing
    e.stopPropagation()
    this.props.dispatcher.closeTab(repository)
  }

  private onAuxClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    repository: Repository | CloningRepository
  ) => {
    // Middle-click closes the tab
    if (e.button === 1) {
      e.stopPropagation()
      this.props.dispatcher.closeTab(repository)
    }
  }

  private getDisplayName(repository: Repository | CloningRepository): string {
    if (repository instanceof Repository) {
      return repository.alias ?? repository.name
    }
    return repository.name
  }

  private renderTab(repository: Repository | CloningRepository) {
    const { selectedRepository } = this.props
    const isSelected = selectedRepository?.id === repository.id
    const displayName = this.getDisplayName(repository)
    const isMissing = repository instanceof Repository && repository.missing
    const isCloning = repository instanceof CloningRepository

    let statusTitle: string | undefined
    if (isMissing) {
      statusTitle = 'Repository not found on disk'
    } else if (isCloning) {
      statusTitle = 'Cloning…'
    }

    return (
      <button
        key={repository.id}
        className={`repository-tab${isSelected ? ' selected' : ''}${isMissing ? ' missing' : ''}${isCloning ? ' cloning' : ''}`}
        onClick={() => this.onTabClick(repository)}
        onAuxClick={e => this.onAuxClick(e, repository)}
        title={statusTitle !== undefined ? statusTitle : repository.path}
        role="tab"
        aria-selected={isSelected}
      >
        <Octicon
          className="repository-tab-icon"
          symbol={iconForRepository(repository)}
        />
        <span className="repository-tab-name">{displayName}</span>
        <button
          className="repository-tab-close"
          onClick={e => this.onCloseClick(e, repository)}
          aria-label={`Close ${displayName}`}
          title={`Close ${displayName}`}
          tabIndex={-1}
        >
          <Octicon symbol={octicons.x} />
        </button>
      </button>
    )
  }

  public render() {
    const { openTabs } = this.props

    // Hide the bar when there is only one (or zero) tabs — no benefit to showing it
    if (openTabs.length <= 1) {
      return null
    }

    return (
      <div className="repository-tab-bar" role="tablist">
        {openTabs.map(repo => this.renderTab(repo))}
      </div>
    )
  }
}
