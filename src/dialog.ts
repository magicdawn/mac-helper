import { run } from '@jxa/run'
import { StandardAdditions } from '@jxa/types'

type AppMethod = 'chooseFromList'

async function runOnCurrentApp(method: AppMethod, ...args: any[]) {
  return await run(
    (method: AppMethod, ...args: any[]) => {
      const app = Application.currentApplication()
      app.includeStandardAdditions = true
      // @ts-ignore
      return app[method]?.(...args)
    },
    method,
    ...args
  )
}

type ChooseOption = { label: string; value: string }

async function chooseFromList(
  list: string[] | ChooseOption[],
  options: StandardAdditions.StandardAdditions.ChooseFromListOptionalParameter = {}
): Promise<string | undefined> {
  let usingOption = false
  let showList: string[] = []
  if (typeof list[0] === 'object') {
    usingOption = true
    showList = (list as ChooseOption[]).map((l) => l.label)
  } else {
    showList = list as string[]
  }

  const selected = await runOnCurrentApp('chooseFromList', showList, {
    multipleSelectionsAllowed: false,
    ...options,
  })

  if (!selected) return
  const label = selected[0]

  if (!usingOption) {
    return label
  } else {
    const val = (list as ChooseOption[]).find((item) => item.label === label)?.value
    return val
  }
}

async function chooseMultipleFromList(
  list: string[] | ChooseOption[],
  options: StandardAdditions.StandardAdditions.ChooseFromListOptionalParameter = {}
): Promise<string[]> {
  let usingOption = false
  let showList: string[] = []
  if (typeof list[0] === 'object') {
    usingOption = true
    showList = (list as ChooseOption[]).map((l) => l.label)
  } else {
    showList = list as string[]
  }

  const selected = await runOnCurrentApp('chooseFromList', showList, {
    multipleSelectionsAllowed: true,
    ...options,
  })

  if (!selected) return []

  if (!usingOption) {
    return selected as string[]
  } else {
    const valArr = (selected as string[]).map(
      (label) => (list as ChooseOption[]).find((item) => item.label === label)!.value
    )
    return valArr
  }
}

export const dialog = {
  chooseFromList,
  chooseMultipleFromList,
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
