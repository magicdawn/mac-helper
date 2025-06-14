import { run } from '@jxa/run'
import type { SystemEvents } from '@jxa/types'

/**
 * 不太准确, 比如 vscode 进程 `Code` 在运行, 检测不到
 */

async function isAppRunning(appName: string): Promise<boolean> {
  return await run((appName) => {
    const app = Application<SystemEvents.SystemEvents.Application>('System Events')
    app.includeStandardAdditions = true
    const runningAppNames: string[] = app.processes().map((p: SystemEvents.SystemEvents.Process) => p.name())
    return runningAppNames.includes(appName)
  }, appName)
}

async function getRunningAppNames(): Promise<string[]> {
  return await run(() => {
    const app = Application<SystemEvents.SystemEvents.Application>('System Events')
    app.includeStandardAdditions = true
    const runningAppNames: string[] = app.processes().map((p: SystemEvents.SystemEvents.Process) => p.name())
    return runningAppNames
  })
}
