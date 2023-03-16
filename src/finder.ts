import { run as jxaRun } from '@jxa/run'
import { type PathFinder as PathFinderType } from 'jxa-common-used'
import { fileURLToPath } from 'url'

export async function getPathFinderSelected() {
  const filePaths: string[] = await jxaRun(() => {
    const app = Application<PathFinderType>('Path Finder')
    return (app.selection() || []).map((x) => x.posixPath())
  })
  return filePaths
}

export async function getFinderSelected() {
  const urls: string[] = await jxaRun(() => {
    const app = Application('Finder')
    const selection = app.selection()
    return (selection || []).map((x) => x.url())
  })
  return urls.map((u) => fileURLToPath(u))
}

export const PathFinder = {
  async allSelected() {
    return getPathFinderSelected()
  },
  async singleSelected(): Promise<string | undefined> {
    return (await getPathFinderSelected())[0]
  },
}

export const Finder = {
  async allSelected() {
    return getFinderSelected()
  },
  async singleSelected(): Promise<string | undefined> {
    return (await getFinderSelected())[0]
  },
}

// ;(async () => {
//   console.log(await getPathFinderSelect())
//   console.log(await getPathFinderSelects())
// })()
