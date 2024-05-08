/* global describe it */
import chai from 'chai'
import child from 'child_process'
import chaiAsPromised from 'chai-as-promised'
import sinon from 'sinon'
import * as depstime from '../src/depstime'

chai.use(chaiAsPromised)
const { expect } = chai

describe('depstime.js', () => {
  describe('create', () => {
    it('Receives valid dependency name and version, should return the correct object', () => {
      const dependencyName = 'a'
      const dependencyVersion = '1.0.0'

      const expected = {
        name: 'a',
        local: {
          version: '1.0.0',
        },
      }

      const result = depstime.create(dependencyName, dependencyVersion)

      expect(result).to.deep.equal(expected)
    })
  })
  describe('process', () => {
    it('Receives a valid dependency object, should resolve with a modified dependency object with time differences', async () => {
      const dependencyObject = {
        name: 'a',
        local: {
          version: '^1.0.0',
        },
      }

      const expected = {
        name: 'a',
        local: {
          version: '^1.0.0',
        },
        wanted: {
          version: '1.2.0',
          timeDeltaToLocal: 86382478,
        },
        latest: {
          version: '2.0.0',
          timeDeltaToLocal: 1923164678,
        },
      }

      const execResult = JSON.stringify({
        name: 'a',
        version: '2.0.0',
        versions: ['1.0.0', '1.2.0', '2.0.0'],
        time: {
          '1.0.0': '2018-09-10T21:25:07.758Z',
          '1.2.0': '2018-09-11T21:24:50.236Z',
          '2.0.0': '2018-10-03T03:37:52.436Z',
        },
      })

      const execMock = sinon.stub(child, 'exec').yields(undefined, execResult)

      const result = await depstime.process(
        dependencyObject,
        true,
        false,
        false,
      )

      expect(result).to.deep.equal(expected)

      execMock.restore()
    })
    it('Receives a dependency object and child_process.exec throws an error, should reject', async () => {
      const dependencyObject = {
        name: 'a',
        local: {
          version: '^1.0.0',
        },
      }

      const execMock = sinon.stub(child, 'exec').yields(new Error('Test Error'))

      const result = depstime.process(dependencyObject, true, false, false)

      await expect(result).to.be.rejected

      execMock.restore()
    })
  })
})
