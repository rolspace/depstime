/* global describe it */
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import jsonfile from 'jsonfile'
import sinon from 'sinon'
import { depstime } from '../src/index'
import * as timediff from '../src/timediff'

chai.use(chaiAsPromised)
const { expect } = chai

describe('depstime/index', () => {
  it('Cannot find package.json file, should reject', async () => {
    const jsonfileStub = sinon.stub(jsonfile, 'readFile').rejects()

    const result = depstime()

    await expect(result).to.be.rejected

    jsonfileStub.restore()
  })

  it('No dependencies found in package.json file, should reject with a specific error', async () => {
    const packageObj = {
      name: 'depstime',
    }

    const jsonfileStub = sinon.stub(jsonfile, 'readFile').resolves(packageObj)

    const result = depstime()

    await expect(result).to.be.rejectedWith('There are no dependencies in the package.json file.')

    jsonfileStub.restore()
  })

  it('Dependencies found in package.json file, should resolve with correct data', async () => {
    const packageObj = {
      name: 'depstime',
      dependencies: {
        a: '^1.2.1',
      },
      devDependencies: {
        b: '3.0.0',
      },
    }

    const parsedDependency1 = {
      package: 'a',
      local: {
        version: '^1.2.1',
      },
    }
    const parsedDependency2 = {
      package: 'b',
      local: {
        version: '3.0.0',
      },
    }

    const processedDependency1 = {
      package: 'a',
      local: {
        version: '^1.2.1',
      },
      wanted: {
        version: '1.2.2',
        time_diff: 86382478,
      },
      latest: {
        version: '2.0.0',
        time_diff: 1923164678,
      },
    }
    const processedDependency2 = {
      package: 'b',
      local: {
        version: '3.0.0',
      },
      wanted: {
        version: '3.0.0',
        time_diff: 0,
      },
      latest: {
        version: '4.0.0',
        time_diff: 11320472695,
      },
    }

    const expected = {
      dependencies: [
        {
          package: 'a',
          local: {
            version: '^1.2.1',
          },
          wanted: {
            version: '1.2.2',
            time_diff: 86382478,
          },
          latest: {
            version: '2.0.0',
            time_diff: 1923164678,
          },
        },
        {
          package: 'b',
          local: {
            version: '3.0.0',
          },
          wanted: {
            version: '3.0.0',
            time_diff: 0,
          },
          latest: {
            version: '4.0.0',
            time_diff: 11320472695,
          },
        }],
    }

    const jsonfileStub = sinon.stub(jsonfile, 'readFile').resolves(packageObj)
    const parseDependencyStub = sinon.stub(timediff, 'create')
    parseDependencyStub.onFirstCall().returns(parsedDependency1)
    parseDependencyStub.onSecondCall().returns(parsedDependency2)

    const processDependencyStub = sinon.stub(timediff, 'process')
    processDependencyStub.onFirstCall().resolves(processedDependency1)
    processDependencyStub.onSecondCall().resolves(processedDependency2)

    const result = await depstime()

    expect(result).to.deep.equal(expected)

    jsonfileStub.restore()
    parseDependencyStub.restore()
    processDependencyStub.restore()
  })
})
