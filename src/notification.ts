/**
 * https://developer.apple.com/library/archive/documentation/LanguagesUtilities/Conceptual/MacAutomationScriptingGuide/DisplayNotifications.html#//apple_ref/doc/uid/TP40016239-CH61-SW1
 */

import { runJxa } from 'run-jxa'

/**
 * 视觉从上到下 title-subtitle-message
 */
export type NotificationOptions = {
  /** fallback 到 "脚本编辑器" */
  title?: string
  /** 通常来说很少见, 写上很诡异 */
  subtitle?: string
  /** 提示：这些声音文件物理存放在 Mac 系统的 /System/Library/Sounds/ 目录下 */
  soundName?:
    | 'Basso'
    | 'Blow'
    | 'Bottle'
    | 'Frog'
    | 'Funk'
    | 'Glass'
    | 'Hero'
    | 'Morse'
    | 'Ping'
    | 'Pop'
    | 'Purr'
    | 'Sosumi'
    | 'Submarine'
    | 'Tink'
    | (string & {})
}

export async function displayNotification(message: string, options?: NotificationOptions) {
  // jxa 直接传 options 报错: execution error: Error: Error: 不能转换类型。 (-1700)
  // 只能拆开喽
  // undefined 更好, 但 jxa 更期望 null 或 空字符串
  const title = options?.title || '' // null 会变成 msgr
  const subtitle = options?.subtitle || ''
  const soundName = options?.soundName || ''
  await runJxa(
    (message: string, title: string, subtitle: string, soundName: string) => {
      const app = Application.currentApplication()
      app.includeStandardAdditions = true
      app.displayNotification(message, { withTitle: title, subtitle, soundName })
      return null
    },
    [message, title, subtitle, soundName],
  )
}
