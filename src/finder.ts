import { availableParallelism } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dedent from 'dedent'
import { uniq } from 'es-toolkit'
import pmap from 'promise.map'
import { runAppleScript } from 'run-applescript'
import { runJxa } from 'run-jxa'
import { isAppRunning } from './app.js'
import type { PathFinder as PathFinderType } from 'jxa-common-used'

/**
 * `App` named epxorts
 */
export const PathFinder = {
  allSelected: PathFinder_allSelected,
  singleSelected: PathFinder_singleSelected,
  setSelected: PathFinder_setSelected,
  getActiveTabDir: PathFinder_getActiveTabDir,
}
export const Finder = {
  allSelected: Finder_allSelected,
  async singleSelected(signal?: AbortSignal): Promise<string | undefined> {
    return (await Finder_allSelected(signal))[0]
  },
  setSelected: Finder_setSelected,
  showInfoWindow: Finder_showInfoWindow,
}
export const QSpace = {
  allSelected: QSpace_allSelected,
  async singleSelected(signal?: AbortSignal): Promise<string | undefined> {
    return (await QSpace_allSelected(signal))[0]
  },
}

/**
 * impls
 */
/* #region PathFinder */
async function PathFinder_allSelected(signal?: AbortSignal) {
  if (!(await isAppRunning('Path Finder'))) {
    return []
  }
  const filePaths: string[] = await runJxa(
    () => {
      const app = Application<PathFinderType>('Path Finder')
      return (app.selection() || []).map((x) => x.posixPath())
    },
    undefined,
    { signal },
  )
  return filePaths
}

async function PathFinder_singleSelected(signal?: AbortSignal): Promise<string | undefined> {
  if (!(await isAppRunning('Path Finder'))) {
    return
  }
  const firstFilePath: string | undefined = await runJxa(
    () => {
      const app = Application<PathFinderType>('Path Finder')
      return (app.selection() || [])[0]?.posixPath()
    },
    undefined,
    { signal },
  )
  return firstFilePath
}

async function PathFinder_setSelected(filePaths: string[], signal?: AbortSignal) {
  await runJxa(
    (filePaths) => {
      const app = Application<PathFinderType>('Path Finder')
      app.select(filePaths)
      return null
    },
    [filePaths],
    { signal },
  )
}

/**
 * 获取 activeTab dir, 当没有 selection 时可用,
 * 要求只能有一个 visible window, 从 jxa 这一层无法区分 window z-index
 */
async function PathFinder_getActiveTabDir(signal?: AbortSignal): Promise<string | undefined> {
  if (!(await isAppRunning('Path Finder'))) return

  const visibleWindowCount: number = await runJxa(
    () => {
      const app = Application<PathFinderType>('Path Finder')
      return app.finderWindows.whose({ visible: true }).length
    },
    undefined,
    { signal },
  )
  if (!visibleWindowCount) return
  if (visibleWindowCount > 1) {
    throw new Error('Multiple visible PathFinder window not supported in PathFinder_getActiveTabDir')
  }

  const dir: string = await runJxa(
    () => {
      const app = Application<PathFinderType>('Path Finder')
      const w = app.finderWindows.whose({ visible: true })[0]
      return w.target.posixPath()
    },
    undefined,
    { signal },
  )
  return dir
}
/* #endregion */

/* #region Finder */
async function Finder_allSelected(signal?: AbortSignal) {
  const urls: string[] = await runJxa(
    () => {
      const app = Application('Finder')
      const selection = app.selection()
      return (selection || []).map((x) => x.url())
    },
    undefined,
    { signal },
  )
  return urls.map((u) => fileURLToPath(u))
}
async function Finder_setSelected(filePaths: string[], signal?: AbortSignal) {
  await runJxa(
    (filePaths) => {
      const app = Application('Finder')
      app.select(filePaths.map((f) => Path(f)))
      app.activate()
      return null
    },
    [filePaths],
    { signal },
  )
}
async function Finder_showInfoWindow(filePaths: string | string[], signal?: AbortSignal) {
  const inputPaths = [filePaths].flat().map((x) => path.resolve(x))
  if (!inputPaths.length) return

  // https://apple.stackexchange.com/questions/409243/use-the-finder-to-act-on-a-path-via-jxa
  // no easy way to write this in JXA
  const applescriptContent = dedent`
    tell application "Finder"
      ${inputPaths.map((p) => `open information window of (POSIX file "${p}" as alias)`).join('\n')}
      activate
    end tell
  `
  await runAppleScript(applescriptContent, { signal })
}
/* #endregion */

/* #region QSpace */
// file item n [inh. item] : A file item.
// properties
//  - id (text, r/o) : The unique identifier of the item.
//  - name (text, r/o) : The name of the file.
//  - urlstr (text, r/o) : The absolute string of URL of the file.
export type QSpaceFileItem = {
  // the unique identifier of the item
  id: () => string
  // the name of the file
  name: () => string
  // the absolute string of URL of the file
  urlstr: () => string
}

async function QSpace_allSelected(signal?: AbortSignal) {
  if (!(await isAppRunning('QSpace Pro'))) {
    return []
  }
  const urls: string[] = await runJxa(
    () => {
      const app = Application('QSpace Pro')
      const selection = (app.selectedItems() || []).map((x: QSpaceFileItem) => x.urlstr())
      return selection
    },
    undefined,
    { signal },
  )
  return urls.map((u) => fileURLToPath(u))
}
/* #endregion */

/* #region Top Level Helper */
export function isRepresentPF(file: string) {
  return /^[@$]?pf$/i.test(file)
}
export function isRepresentQS(file: string) {
  return /^[@$]?qs$/i.test(file)
}
export const isRepresentPFDescription = '@pf or $pf or pf, ignore case'
export const isRepresentQSDescription = '@qs or $qs or qs, ignore case'

/**
 * 处理 `@pf` `@qs`, ignore case
 */
export async function normalizeInputFileList(fileList: string[]) {
  return uniq(
    (
      await pmap(
        fileList,
        async (f) => {
          if (process.platform === 'darwin') {
            if (isRepresentPF(f)) return await PathFinder.allSelected()
            if (isRepresentQS(f)) return await QSpace.allSelected()
          }
          return path.resolve(f)
        },
        availableParallelism(),
      )
    ).flat(),
  )
}
/* #endregion */
