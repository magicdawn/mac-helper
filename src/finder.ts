import { run as jxaRun } from '@jxa/run'
import { type PathFinder as PathFinderType } from 'jxa-common-used'
import { fileURLToPath } from 'url'
import { isAppRunning } from './app'

/**
 * `App` named epxorts
 */
export const PathFinder = {
  async allSelected() {
    return getPathFinderSelected()
  },
  async singleSelected(): Promise<string | undefined> {
    return (await getPathFinderSelected())[0]
  },
  async setSelected(filePaths: string[]) {
    await setPathFinderSelected(filePaths)
  },
}
export const Finder = {
  async allSelected() {
    return getFinderSelected()
  },
  async singleSelected(): Promise<string | undefined> {
    return (await getFinderSelected())[0]
  },
  async setSelected(filePaths: string[]) {
    await setFinderSelected(filePaths)
  },
}
export const QSpace = {
  async allSelected() {
    return getQSpaceSelected()
  },
  async singleSelected(): Promise<string | undefined> {
    return (await getQSpaceSelected())[0]
  },
}

/**
 * impls
 */

export async function getPathFinderSelected() {
  if (!(await isAppRunning('Path Finder'))) {
    return []
  }
  const filePaths: string[] = await jxaRun(() => {
    const app = Application<PathFinderType>('Path Finder')
    return (app.selection() || []).map((x) => x.posixPath())
  })
  return filePaths
}

export async function setPathFinderSelected(filePaths: string[]) {
  await jxaRun((filePaths: string[]) => {
    const app = Application<PathFinderType>('Path Finder')
    app.select(filePaths)
  }, filePaths)
}

export async function getFinderSelected() {
  const urls: string[] = await jxaRun(() => {
    const app = Application('Finder')
    const selection = app.selection()
    return (selection || []).map((x) => x.url())
  })
  return urls.map((u) => fileURLToPath(u))
}

export async function setFinderSelected(filePaths: string[]) {
  await jxaRun((filePaths: string[]) => {
    const app = Application('Finder')
    app.select(filePaths.map((f) => Path(f)))
    app.activate()
  }, filePaths)
}

// file item n [inh. item] : A file item.
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

export async function getQSpaceSelected() {
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

// ;(async () => {
//   console.log(await getQSpaceSelected())
// })()
