import { run } from '@jxa/run'
import type { GoogleChrome } from 'jxa-common-used'

export type ActiveTab = { url: string; title: string }

export const Chrome = {
  async getActiveTab(): Promise<ActiveTab> {
    return await getChromeActiveTab()
  },
}

export async function getChromeActiveTab(): Promise<ActiveTab> {
  return await run(() => {
    const app = Application<GoogleChrome>('Google Chrome')
    app.includeStandardAdditions = true

    const win = (app.windows() || []).find((w) => !w.minimized())
    const tab = win?.activeTab()
    return {
      url: tab?.url(),
      title: tab?.title(),
    }
  })
}

// getChromeActiveTab().then(console.log)
