import { runJxa } from 'run-jxa'
import type { StandardAdditions } from '@jxa/types'

export const dialog = {
  prompt,
  chooseFromList,
  chooseMultipleFromList,
}

async function prompt(label: string, defaultValue = '', signal?: AbortSignal): Promise<string> {
  // if cancel dialog, will throw error
  try {
    return (
      (await runJxa(
        (label) => {
          const app = Application.currentApplication()
          app.includeStandardAdditions = true
          const response = app.displayDialog(label, { defaultAnswer: '' })
          return response.textReturned
        },
        [label],
        { signal },
      )) || defaultValue
    )
  } catch {
    return defaultValue
  }
}

type AppMethod = 'chooseFromList'

async function runOnCurrentApp(method: AppMethod, args: any[] | undefined, signal?: AbortSignal) {
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

type ChooseOption = { label: string; value: string }

async function chooseFromList(
  list: string[] | ChooseOption[],
  options: StandardAdditions.StandardAdditions.ChooseFromListOptionalParameter = {},
  signal?: AbortSignal,
): Promise<string | undefined> {
  let usingOption = false
  let showList: string[] = []
  if (typeof list[0] === 'object') {
    usingOption = true
    showList = (list as ChooseOption[]).map((l) => l.label)
  } else {
    showList = list as string[]
  }

  const selected = await runOnCurrentApp(
    'chooseFromList',
    [showList, { multipleSelectionsAllowed: false, ...options }],
    signal,
  )

  if (!selected) return
  const label = (selected as any)[0]

  if (!usingOption) {
    return label
  } else {
    const val = (list as ChooseOption[]).find((item) => item.label === label)?.value
    return val
  }
}

async function chooseMultipleFromList(
  list: string[] | ChooseOption[],
  options: StandardAdditions.StandardAdditions.ChooseFromListOptionalParameter = {},
  signal?: AbortSignal,
): Promise<string[]> {
  let usingOption = false
  let showList: string[] = []
  if (typeof list[0] === 'object') {
    usingOption = true
    showList = (list as ChooseOption[]).map((l) => l.label)
  } else {
    showList = list as string[]
  }

  const selected = await runOnCurrentApp(
    'chooseFromList',
    [showList, { multipleSelectionsAllowed: true, ...options }],
    signal,
  )

  if (!selected) return []

  if (!usingOption) {
    return selected as string[]
  } else {
    const valArr = (selected as string[]).map(
      (label) => (list as ChooseOption[]).find((item) => item.label === label)!.value,
    )
    return valArr
  }
}

// dialog.chooseFromList(['hello', 'world']).then((selected) => {
//   console.log(selected)
// })

// dialog
//   .chooseFromList([
//     { value: 'yes', label: '是吧~~~' },
//     { value: 'halo', label: 'Halo 啊洒洒' },
//   ])
//   .then((selected) => {
//     console.log(selected)
//   })

// dialog
//   .chooseMultipleFromList(
//     [
//       { value: 'yes', label: '是吧~~~' },
//       { value: 'halo', label: 'Halo 啊洒洒' },
//     ],
//     {
//       withTitle: 'title',
//       withPrompt: 'prompt',
//       cancelButtonName: '取消!',
//       // @ts-ignore
//       okButtonName: '酱紫吧~',
//     }
//   )
//   .then((selected) => {
//     console.log(selected)
//   })
// dialog.prompt('hello', 'world').then(console.log)
