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

export type AppInfo = {
  name: string
  bundleId: string
  path?: string
}

export async function getRunningAppInfos(signal?: AbortSignal): Promise<AppInfo[]> {
  return await runJxa(
    () => {
      const app = Application('System Events')
      app.includeStandardAdditions = true
      const runningAppNames: AppInfo[] = app.applicationProcesses().map((p) => {
        return {
          name: p.name(),
          bundleId: p.bundleIdentifier(),
          path: p.applicationFile()?.posixPath(),
        }
      })
      return runningAppNames
    },
    undefined,
    { signal },
  )
}

export async function getForegroundAppInfo(signal?: AbortSignal): Promise<{
  foregroundAppName: string | undefined
  foregroundAppBundleId: string | undefined
  foregroundAppPath: string | undefined
}> {
  return await runJxa(
    function () {
      const app = Application('System Events')
      app.includeStandardAdditions = true
      const foregroundApp = app.applicationProcesses.whose({ frontmost: true })?.[0]
      return {
        foregroundAppName: foregroundApp?.name(),
        foregroundAppBundleId: foregroundApp?.bundleIdentifier(),
        foregroundAppPath: foregroundApp?.applicationFile()?.posixPath(),
      }
    },
    undefined,
    { signal },
  )
}
