/* global describe it */
import chai from 'chai'
import child from 'child_process'
import chaiAsPromised from 'chai-as-promised'
import sinon from 'sinon'
import * as dependency from '../src/dependency'

chai.use(chaiAsPromised)
const expect = chai.expect

describe('depstime/dependency', () => {
  describe('parse', () => {
    it('receives valid parameters, should return a new object', () => {
      const dependencyName = 'a'
      const dependencyVersion = '1.0.0'

      const expected = {
        package: 'a',
        local: {
          version: '1.0.0',
        },
      }

      const result = dependency.parse(dependencyName, dependencyVersion)

      expect(result).to.deep.equal(expected)
    })
  })
  describe('process', () => {
    it('Receives a dependency value, should resolve with a modified dependency object with time differences', async () => {
      const dependencyObject = {
        package: 'a',
        local: {
          version: '^1.0.0',
        },
      }

      const expected = {
        package: 'a',
        local: {
          version: '^1.0.0',
        },
        wanted: {
          version: '1.2.0',
          time_diff: 86382478,
        },
        latest: {
          version: '2.0.0',
          time_diff: 1923164678,
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

      const result = await dependency.process(dependencyObject, false)

      execMock.restore()

      return expect(result).to.deep.equal(expected)
    })
    it('Receives a dependency object and exec throws an error, should reject', () => {
      const dependencyObject = {
        package: 'a',
        local: {
          version: '^1.0.0',
        },
      }

      const execMock = sinon.stub(child, 'exec').yields(new Error('Test Error'))

      const result = dependency.process(dependencyObject, false)

      execMock.restore()

      return expect(result).to.be.rejected
    })
  })
})
