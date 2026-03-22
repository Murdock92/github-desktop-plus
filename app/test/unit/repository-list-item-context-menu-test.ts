import { describe, it } from 'node:test'
import assert from 'node:assert'

import { Repository } from '../../src/models/repository'
import { generateRepositoryListContextMenu } from '../../src/ui/repositories-list/repository-list-item-context-menu'

describe('repository list item context menu', () => {
  const shellLabel = undefined
  const externalEditorLabel = undefined
  const onViewInBrowser = () => {}
  const onOpenInNewWindow = () => {}
  const onOpenInShell = () => {}
  const onShowRepository = () => {}
  const onOpenInExternalEditor = () => {}
  const onRemoveRepository = () => {}
  const onChangeRepositoryAlias = () => {}
  const onRemoveRepositoryAlias = () => {}
  const onChangeRepositoryGroupName = () => {}
  const onRemoveRepositoryGroupName = () => {}

  it('includes the new-window action for available repositories', () => {
    const repository = new Repository('/Users/test/example', 1, null, false)

    const items = generateRepositoryListContextMenu({
      repository,
      shellLabel,
      externalEditorLabel,
      askForConfirmationOnRemoveRepository: false,
      onViewInBrowser,
      onOpenInNewWindow,
      onOpenInShell,
      onShowRepository,
      onOpenInExternalEditor,
      onRemoveRepository,
      onChangeRepositoryAlias,
      onRemoveRepositoryAlias,
      onChangeRepositoryGroupName,
      onRemoveRepositoryGroupName,
    })

    assert(items.some(item => item.label === 'Open Repository in New Window'))
  })

  it('omits the new-window action for missing repositories', () => {
    const repository = new Repository('/Users/test/example', 1, null, true)

    const items = generateRepositoryListContextMenu({
      repository,
      shellLabel,
      externalEditorLabel,
      askForConfirmationOnRemoveRepository: false,
      onViewInBrowser,
      onOpenInNewWindow,
      onOpenInShell,
      onShowRepository,
      onOpenInExternalEditor,
      onRemoveRepository,
      onChangeRepositoryAlias,
      onRemoveRepositoryAlias,
      onChangeRepositoryGroupName,
      onRemoveRepositoryGroupName,
    })

    assert.equal(
      items.some(item => item.label === 'Open Repository in New Window'),
      false
    )
  })

  it('omits the new-window action when no handler is provided', () => {
    const repository = new Repository('/Users/test/example', 1, null, false)

    const items = generateRepositoryListContextMenu({
      repository,
      shellLabel,
      externalEditorLabel,
      askForConfirmationOnRemoveRepository: false,
      onViewInBrowser,
      onOpenInShell,
      onShowRepository,
      onOpenInExternalEditor,
      onRemoveRepository,
      onChangeRepositoryAlias,
      onRemoveRepositoryAlias,
      onChangeRepositoryGroupName,
      onRemoveRepositoryGroupName,
    })

    assert.equal(
      items.some(item => item.label === 'Open Repository in New Window'),
      false
    )
  })
})
