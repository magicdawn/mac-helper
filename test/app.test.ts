import { describe, expect, it } from 'vitest'
import { isAppRunning } from '../src/app'

describe('App', () => {
  // unable to test in CI
  it.skip('isAppRunning works', async () => {
    expect(await isAppRunning('Visual Studio Code')).toBe(true)
  })
})
