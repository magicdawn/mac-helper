import { availableParallelism } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { run as jxaRun } from '@jxa/run'
import { uniq } from 'es-toolkit'
import pmap from 'promise.map'
import { isAppRunning } from './app'
import type { PathFinder as PathFinderType } from 'jxa-common-used'

/**
 * `App` named epxorts
 */
export const PathFinder = {
  allSelected() {
    return PathFinder_allSelected()
  },
  singleSelected() {
    return PathFinder_singleSelected()
  },
  setSelected(filePaths: string[]) {
    return PathFinder_setSelected(filePaths)
  },
  getActiveTabDir: PathFinder_getActiveTabDir,
}
export const Finder = {
  allSelected() {
    return Finder_allSelected()
  },
  async singleSelected(): Promise<string | undefined> {
    return (await Finder_allSelected())[0]
  },
  setSelected(filePaths: string[]) {
    return Finder_setSelected(filePaths)
  },
}
export const QSpace = {
  allSelected() {
    return QSpace_allSelected()
  },
  async singleSelected(): Promise<string | undefined> {
    return (await QSpace_allSelected())[0]
  },
}

/**
 * impls
 */
/* #region PathFinder */
async function PathFinder_allSelected() {
  if (!(await isAppRunning('Path Finder'))) {
    return []
  }
  const filePaths: string[] = await jxaRun(() => {
    const app = Application<PathFinderType>('Path Finder')
    return (app.selection() || []).map((x) => x.posixPath())
  })
  return filePaths
}

async function PathFinder_singleSelected(): Promise<string | undefined> {
  if (!(await isAppRunning('Path Finder'))) {
    return
  }
  const firstFilePath: string | undefined = await jxaRun(() => {
    const app = Application<PathFinderType>('Path Finder')
    return app.selection[0]?.posixPath()
  })
  return firstFilePath
}

async function PathFinder_setSelected(filePaths: string[]) {
  await jxaRun((filePaths: string[]) => {
    const app = Application<PathFinderType>('Path Finder')
    app.select(filePaths)
  }, filePaths)
}

/**
 * 获取 activeTab dir, 当没有 selection 时可用,
 * 要求只能有一个 visible window, 从 jxa 这一层无法区分 window z-index
 */
async function PathFinder_getActiveTabDir(): Promise<string | undefined> {
  if (!(await isAppRunning('Path Finder'))) return

  const visibleWindowCount: number = await jxaRun(() => {
    const app = Application<PathFinderType>('Path Finder')
    return app.finderWindows.whose({ visible: true }).length
  })
  if (!visibleWindowCount) return
  if (visibleWindowCount > 1) {
    throw new Error('Multiple visible PathFinder window not supported in PathFinder_getActiveTabDir')
  }

  const dir: string = await jxaRun(() => {
    const app = Application<PathFinderType>('Path Finder')
    const w = app.finderWindows.whose({ visible: true })[0]
    return w.target.posixPath()
  })
  return dir
}
/* #endregion */

/* #region Finder */
async function Finder_allSelected() {
  const urls: string[] = await jxaRun(() => {
    const app = Application('Finder')
    const selection = app.selection()
    return (selection || []).map((x) => x.url())
  })
  return urls.map((u) => fileURLToPath(u))
}
async function Finder_setSelected(filePaths: string[]) {
  await jxaRun((filePaths: string[]) => {
    const app = Application('Finder')
    app.select(filePaths.map((f) => Path(f)))
    app.activate()
  }, filePaths)
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

async function QSpace_allSelected() {
  if (!(await isAppRunning('QSpace Pro'))) {
    return []
  }
  const urls: string[] = await jxaRun(() => {
    const app = Application('QSpace Pro')
    const selection = (app.selectedItems() || []).map((x: QSpaceFileItem) => x.urlstr())
    return selection
  })
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

;(async () => {
  console.log(await normalizeInputFileList(['@pf']))
  console.log(await PathFinder.getActiveTabDir())
})()
