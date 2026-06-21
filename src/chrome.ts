import { runJxa } from 'run-jxa'
import { isAppRunning } from './app.js'
import type { GoogleChrome } from 'jxa-common-used'

export type ActiveTab = { url: string; title: string }

export enum BrowserAppName {
  Chrome = 'Google Chrome',
  Brave = 'Brave Browser',
}

export class ChromiumBrowserHelper {
  constructor(public appName: string) {}
  isRunning = (): Promise<boolean> => isChromiumAppRunning(this.appName)
  isFrontmost = (signal?: AbortSignal): Promise<boolean> => getChromiumIsFrontmost(this.appName, signal)
  getActiveTab = (signal?: AbortSignal): Promise<ActiveTab | undefined> => getChromiumActiveTab(this.appName, signal)
}

export const Chrome = new ChromiumBrowserHelper(BrowserAppName.Chrome)
export const Brave = new ChromiumBrowserHelper(BrowserAppName.Brave)

/* #region implements */
export function isChromiumAppRunning(appName: string = BrowserAppName.Chrome): Promise<boolean> {
  return isAppRunning(appName)
}
export async function getChromiumActiveTab(
  appName: string = BrowserAppName.Chrome,
  signal?: AbortSignal,
): Promise<ActiveTab | undefined> {
  if (!(await isChromiumAppRunning(appName))) return
  return await runJxa(
    (appName: string) => {
      const app = Application<GoogleChrome>(appName)
      app.includeStandardAdditions = true
      const win = (app.windows() || []).find((w) => !w.minimized())
      const tab = win?.activeTab()
      return {
        url: tab?.url(),
        title: tab?.title(),
      }
    },
    [appName],
    { signal },
  )
}
export async function getChromiumIsFrontmost(
  appName: string = BrowserAppName.Chrome,
  signal?: AbortSignal,
): Promise<boolean> {
  if (!isChromiumAppRunning(appName)) return false
  return await runJxa(
    (appName: string) => {
      const app = Application<GoogleChrome>(appName)
      app.includeStandardAdditions = true
      return app.frontmost()
    },
    [appName],
    { signal },
  )
}
/* #endregion */
