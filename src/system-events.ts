import { runJxa } from 'run-jxa'
import type { SystemEvents } from '@jxa/types'

/**
 * 不太准确, 比如 vscode 进程 `Code` 在运行, 检测不到
 */
async function isAppRunning(appName: string, signal?: AbortSignal): Promise<boolean> {
  return await runJxa(
    (appName) => {
      const app = Application<SystemEvents.SystemEvents.Application>('System Events')
      app.includeStandardAdditions = true
      const runningAppNames: string[] = app.processes().map((p: SystemEvents.SystemEvents.Process) => p.name())
      return runningAppNames.includes(appName)
    },
    [appName],
    { signal },
  )
}

async function getRunningAppNames(signal?: AbortSignal): Promise<string[]> {
  return await runJxa(
    () => {
      const app = Application<SystemEvents.SystemEvents.Application>('System Events')
      app.includeStandardAdditions = true
      const runningAppNames: string[] = app.processes().map((p: SystemEvents.SystemEvents.Process) => p.name())
      return runningAppNames
    },
    undefined,
    { signal },
  )
}
