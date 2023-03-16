import { run } from '@jxa/run'
import { iTerm2 } from 'jxa-common-used'

export async function runInIterm(command: string) {
  await run((command) => {
    const app = Application<iTerm2>('iTerm')
    app.includeStandardAdditions = true
    app.activate()

    const tab = app.createTabWithDefaultProfile(app.currentWindow)
    const sess = tab.currentSession
    app.write(sess, { text: command })
  }, command)
}

export const iTerm = {
  run: runInIterm,
  runInIterm,
}
