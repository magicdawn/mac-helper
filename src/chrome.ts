import { run } from '@jxa/run'
import { type GoogleChrome } from 'jxa-common-used'

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

    const wins = (app.windows() || []).filter((w) => !w.minimized())
    const tab = wins[0]?.activeTab()
    return {
      url: tab?.url(),
      title: tab?.title(),
    }
  })
}

// getChromeActiveTab().then(console.log)
