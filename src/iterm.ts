import { run } from '@jxa/run'
import { iTerm2 } from 'jxa-common-used'

export async function runInIterm(command: string, reuse = true) {
  await run(
    (command, reuse) => {
      const app = Application<iTerm2>('iTerm')
      app.includeStandardAdditions = true
      app.activate()

      let usingSession: iTerm2.Session | undefined

      // reuse when possible
      if (reuse) {
        const session: iTerm2.Session = app.currentWindow().currentSession()
        const isIdle = session?.isAtShellPrompt()
        if (isIdle) {
          usingSession = session
        }
      }

      // create new tab when necessary
      if (!usingSession) {
        const tab = app.createTabWithDefaultProfile(app.currentWindow)
        usingSession = tab.currentSession()
      }

      if (!usingSession) {
        return
      }

      app.write(usingSession, { text: command })
    },
    command,
    reuse,
  )
}

export const iTerm = {
  run: runInIterm,
  runInIterm,
}
