import { exec } from 'node:child_process'

/**
 * file path based process running detect.
 * for vscode, process name = `Code`, file is `Visual Studio Code.app`, the `Visual Studio Code` should be passed
 */

export function isAppRunning(appName: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    exec(`ps -ax -o command`, (err, stdout, stderr) => {
      if (err) return reject(err)

      const lines = stdout
        .trim()
        .split('\n')
        .map((x) => x.trim())
        .filter(Boolean)
      const searchText = `${appName}.app/Contents/MacOS/`

      const running = !!lines.find((line) => line.includes(searchText))
      resolve(running)
    })
  })
}

// isAppRunning('Visual Studio Code').then(console.log)
