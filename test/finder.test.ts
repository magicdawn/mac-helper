/// <reference types='@jxa/global-type' />
/// <reference types='@jxa/types' />

import should from 'should'
import delay from 'delay'

import { run } from '@jxa/run'
import { PathFinder, Finder } from '../src/finder'
import { PathFinder as PathFinderType } from 'jxa-common-used'
import path from 'path'

describe('Finder', () => {
  describe('PathFinder', () => {
    it('PathFinder works', async () => {
      await run((__filename) => {
        const app = Application<PathFinderType>('Path Finder')
        app.select(__filename)
      }, __filename)

      await delay(200)

      const selected = await PathFinder.singleSelected()
      should.ok(selected)
      selected!.should.equal(__filename)
    })

    it('PathFinder multiple works', async () => {
      const dir = path.join(__dirname, '..') + '/'
      const files = [dir + 'package.json', dir + 'tsconfig.json']
      await PathFinder.setSelected(files)

      await delay(200)

      const selected = await PathFinder.allSelected()
      selected.length.should.above(0)
      selected.should.deepEqual(files)
    })
  })

  // Finder 作妖, 必须切换到 finder, 下面获取的路径才对
  // 需要测试再打开
  describe('Finder', async () => {
    it('Finder works', async () => {
      {
        await Finder.setSelected([__filename])
        await delay(200)

        const selected = await Finder.singleSelected()
        should.ok(selected)
        selected!.should.equal(__filename)
      }

      {
        const dir = path.join(__dirname, '..') + '/'
        const files = [dir + 'package.json', dir + 'tsconfig.json']
        await Finder.setSelected(files)
        await delay(200)

        const selected = await Finder.allSelected()
        selected.length.should.above(0)
        selected.should.deepEqual(files)
      }
    })
  })
})
