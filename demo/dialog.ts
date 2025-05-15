import { dialog } from '../src/dialog'

void (async () => {
  const username = await dialog.prompt('What is your name?')
  console.log({ username })
  console.log(`Hello ${username}`)
})()
