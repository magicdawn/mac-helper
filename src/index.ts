import '@jxa/global-type'
import { run as jxaRun } from '@jxa/run'
import AppleScript from 'applescript'
import pify from 'promise.ify'

const SCRIPT_FI_SELECTION = `
tell application "Path Finder"
	get POSIX path of (get item 1 of (get selection))
end tell
`
export async function deprecated_getFinderSelectionViaAppleScript() {
  const result = (await pify(
    AppleScript.execString,
    AppleScript
  )(SCRIPT_FI_SELECTION.trim())) as string[]
  const url = result && result[0]
  return url
}

export async function getPathFinderSelect() {
  const filePath: string | null = await jxaRun(() => {
    const app = Application('Path Finder')
    return app.selection()?.[0]?.posixPath() ?? null
  })
  return filePath
}

export async function getPathFinderSelects() {
  const filePaths: string[] = await jxaRun(() => {
    const app = Application('Path Finder')
    return app.selection()?.map((x: any) => x?.posixPath())
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
