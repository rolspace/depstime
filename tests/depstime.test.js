import * as chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import sinon from 'sinon'
import { create, process } from '../src/depstime.js'

chai.use(chaiAsPromised)
const { expect } = chai

describe('depstime.js', () => {
  afterEach(() => {
    sinon.restore()
  })

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

      const result = create(dependencyName, dependencyVersion)

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
          timeDifference: 86382478,
        },
        latest: {
          version: '2.0.0',
          timeDifference: 1923164678,
        },
      }

      const executeFakeResult = JSON.stringify({
        name: 'a',
        version: '2.0.0',
        versions: ['1.0.0', '1.2.0', '2.0.0'],
        time: {
          '1.0.0': '2018-09-10T21:25:07.758Z',
          '1.2.0': '2018-09-11T21:24:50.236Z',
          '2.0.0': '2018-10-03T03:37:52.436Z',
        },
      })

      const executeFake = sinon.fake.yields(undefined, executeFakeResult)
      const getTimeStub = sinon.stub()
      getTimeStub.onFirstCall().returns(1536701090236)
      getTimeStub.onSecondCall().returns(1536614707758)
      getTimeStub.onThirdCall().returns(1538537872436)
      getTimeStub.onCall(3).returns(1536614707758)

      const result = await process(dependencyObject, true, false, false, {
        execute: executeFake,
        getTime: getTimeStub,
        getMinVersion: sinon.fake.returns('1.0.0'),
        getMaxVersion: sinon.fake.returns('1.2.0'),
      })

      expect(result).to.deep.equal(expected)
    })

    it('Receives a dependency object and child_process.exec throws an error, should reject', async () => {
      const dependencyObject = {
        name: 'a',
        local: {
          version: '^1.0.0',
        },
      }

      const executeFake = sinon.fake.yields(new Error('Test Error'))

      const result = process(dependencyObject, true, false, false, {
        execute: executeFake,
      })

      await expect(result).to.be.rejected
    })
  })
})
