import { run as jxaRun } from '@jxa/run'
import { type PathFinder as PathFinderType } from 'jxa-common-used'

export async function getPathFinderSelect() {
  const filePath: string | null = await jxaRun(() => {
    const app = Application<PathFinderType>('Path Finder')
    return app.selection()?.[0]?.posixPath() ?? null
  })
  return filePath
}

export async function getPathFinderSelects() {
  const filePaths: string[] = await jxaRun(() => {
    const app = Application<PathFinderType>('Path Finder')
    return (app.selection() || []).map((x) => x.posixPath())
  })
  return filePaths
}

export const PathFinder = {
  singleSelected() {
    return getPathFinderSelect()
  },
  allSelected() {
    return getPathFinderSelects()
  },
}
// ;(async () => {
//   console.log(await getPathFinderSelect())
//   console.log(await getPathFinderSelects())
// })()
