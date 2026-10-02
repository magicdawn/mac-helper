import { runJxa } from 'run-jxa'

export type AppMethod = 'chooseFromList'

export async function runOnCurrentApp(method: AppMethod, args: any[] | undefined, signal?: AbortSignal) {
  return await runJxa(
    (method: AppMethod, ...args: any[]) => {
      const app = Application.currentApplication()
      app.includeStandardAdditions = true
      // @ts-ignore
      return app[method]?.(...args)
    },
    [method, ...(args || [])],
    { signal },
  )
}
