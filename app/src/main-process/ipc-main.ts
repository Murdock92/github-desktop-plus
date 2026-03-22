import { RequestChannels, RequestResponseChannels } from '../lib/ipc-shared'
// eslint-disable-next-line no-restricted-imports
import { ipcMain } from 'electron'
import { IpcMainEvent, IpcMainInvokeEvent } from 'electron/main'
import { isTrustedIPCSender } from './trusted-ipc-sender'

type RequestChannelListener<T extends keyof RequestChannels> = (
  event: IpcMainEvent,
  ...args: Parameters<RequestChannels[T]>
) => void

type RequestResponseChannelListener<T extends keyof RequestResponseChannels> = (
  event: IpcMainInvokeEvent,
  ...args: Parameters<RequestResponseChannels[T]>
) => ReturnType<RequestResponseChannels[T]>

type SafeListener<E extends IpcMainEvent | IpcMainInvokeEvent, R> = ((
  event: E,
  ...args: any
) => R | undefined) & { __isSafeListener: true }

/**
 * Subscribes to the specified IPC channel and provides strong typing of
 * the channel name, and request parameters. This is the equivalent of
 * using ipcMain.on.
 */
export function on<T extends keyof RequestChannels>(
  channel: T,
  listener: RequestChannelListener<T>
) {
  const wrappedListener = safeListener(listener)
  ipcMain.on(channel, wrappedListener)
  return wrappedListener
}

/**
 * Subscribes to the specified IPC channel and provides strong typing of
 * the channel name, and request parameters. This is the equivalent of
 * using ipcMain.once
 */
export function once<T extends keyof RequestChannels>(
  channel: T,
  listener: RequestChannelListener<T>
) {
  const wrappedListener = safeListener(listener)
  ipcMain.once(channel, wrappedListener)
  return wrappedListener
}

/**
 * Subscribes to the specified invokeable IPC channel and provides strong typing
 * of the channel name, and request parameters. This is the equivalent of using
 * ipcMain.handle.
 */
export function handle<T extends keyof RequestResponseChannels>(
  channel: T,
  listener: RequestResponseChannelListener<T>
) {
  const wrappedListener = safeListener(listener)
  ipcMain.handle(channel, wrappedListener)
  return wrappedListener
}

function safeListener<E extends IpcMainEvent | IpcMainInvokeEvent, R>(
  listener: (event: E, ...a: any) => R
): SafeListener<E, R> {
  const wrapped = ((event: E, ...args: any) => {
    if (!isTrustedIPCSender(event.sender)) {
      log.error(
        `IPC message received from invalid sender: ${event.senderFrame?.url}`
      )
      return
    }

    return listener(event, ...args)
  }) as SafeListener<E, R>

  wrapped.__isSafeListener = true
  return wrapped
}

/**
 * Unsubscribes from the specified IPC channel. This is the equivalent of using
 * ipcMain.removeListener.
 *
 * **WARNING**: This must be called with the return value of the `on` or `once`
 * function that was used to subscribe to the channel.
 */
export function removeListener<T extends keyof RequestChannels>(
  channel: T,
  listener: SafeListener<IpcMainEvent, void>
) {
  ipcMain.removeListener(channel, listener)
}
