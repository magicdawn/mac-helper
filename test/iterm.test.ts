import { describe, it } from 'vitest'
import { iTerm } from '../src'

describe('iTerm', () => {
  it('works', async () => {
    await iTerm.run(`echo "${__filename}"`)
  })
})
