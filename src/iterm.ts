import { run } from '@jxa/run'
import type { iTerm2 } from 'jxa-common-used'

export async function runInIterm(command: string, reuse = true) {
  type RunResult = 'no-session' | undefined
  const result: RunResult = await run(
    (command, reuse): RunResult => {
      const app = Application<iTerm2>('iTerm')
      app.includeStandardAdditions = true
      app.activate()

      let usingSession: iTerm2.Session | undefined

      // reuse when possible
      if (reuse) {
        const session: iTerm2.Session | undefined = app.currentWindow()?.currentSession()
        const isIdle = session?.isAtShellPrompt()
        if (isIdle) {
          usingSession = session
        }
      }

      // create new tab when necessary
      if (!usingSession) {
        const tab = app.createTabWithDefaultProfile(app.currentWindow)
        usingSession = tab?.currentSession() // TODO: iterm2 updated, this code no longer works
      }

      if (!usingSession) return 'no-session'
      app.write(usingSession, { text: command })
    },
    command,
    reuse,
  )

  if (result === 'no-session') {
    console.error('No iTerm session found')
  }
}

export const iTerm = {
  run: runInIterm,
  runInIterm,
}
