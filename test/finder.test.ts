/// <reference types='@jxa/global-type' />
/// <reference types='@jxa/types' />
/// <reference types='node' />

// tsconfig only for src/

/* eslint-disable require-await */
import path from 'node:path'
import delay from 'delay'
import should from 'should'
import { describe, it } from 'vitest'
import { Finder, PathFinder } from '../src/finder'

describe.sequential('PathFinder', () => {
  it('PathFinder works', async () => {
    await PathFinder.setSelected([__filename])
    await delay(200)

    const selected = await PathFinder.singleSelected()
    should.ok(selected)
    selected!.should.equal(__filename)
  })
  it('PathFinder multiple works', async () => {
    await delay(200)
    const dir = `${path.join(__dirname, '..')}/`
    const files = [`${dir}package.json`, `${dir}tsconfig.json`]
    await PathFinder.setSelected(files)
    await delay(200)

    const selected = await PathFinder.allSelected()
    selected.length.should.above(0)
    selected.should.deepEqual(files)
  })
})

// Finder 作妖, 必须切换到 finder, 下面获取的路径才对
// 需要测试再打开
describe.sequential('Finder', async () => {
  it('Finder works', async () => {
    {
      await Finder.setSelected([__filename])
      await delay(200)

      const selected = await Finder.singleSelected()
      should.ok(selected)
      selected!.should.equal(__filename)
    }

    {
      const dir = `${path.join(__dirname, '..')}/`
      const files = [`${dir}package.json`, `${dir}tsconfig.json`]
      await Finder.setSelected(files)
      await delay(200)

      const selected = await Finder.allSelected()
      selected.length.should.above(0)
      selected.should.deepEqual(files)
    }
  })
})
