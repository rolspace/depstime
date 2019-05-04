import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import jsonfile from 'jsonfile'
import sinon from 'sinon'
import depstime from '../src/index'
import * as utils from '../src/utils'

chai.use(chaiAsPromised)
const expect = chai.expect

describe('depstime', () => {
  it('No such file or directory, should throw error', () => {
    const jsonfileStub = sinon.stub(jsonfile, 'readFile').rejects()
    
    const result = depstime()

    jsonfileStub.restore()

    return expect(result).to.be.rejected
  })
  
  it('No dependencies in package.json, should throw error', () => {
    const packageObj = {
      name: 'depstime'
    }

    const jsonfileStub = sinon.stub(jsonfile, 'readFile').resolves(packageObj)
    
    const result = depstime()

    jsonfileStub.restore()
    
    return expect(result).to.be.rejected
  })

  it('Dependencies in package.json, should resolve with correct data', async () => {
    const packageObj = {
      name: 'depstime',
      dependencies: {
        a: '^1.2.1'
      },
      devDependencies: {
        b: '3.0.0'
      }
    }

    const parsedDependencies = [{
      package: 'a',
      local: {
        version: '^1.2.1'
      }
    },
    {
      package: 'b',
      local: {
        version: '3.0.0'
      }
    }]

    const processedDependency1 = {
      package: 'a',
      local: {
        version: '^1.2.1'
      },
      wanted: {
        version: '1.2.2',
        time_diff: 86382478
      },
      latest: {
        version: '2.0.0',
        time_diff: 1923164678
      }
    }

    const processedDependency2 = {
      package: 'b',
      local: {
        version: '3.0.0'
      },
      wanted: {
        version: '3.0.0',
        time_diff: 0
      },
      latest: {
        version: '4.0.0',
        time_diff: 11320472695
      }
    }

    const expected = { 'dependencies': [{
      package: 'a',
      local: {
        version: '^1.2.1'
      },
      wanted: {
        version: '1.2.2',
        time_diff: 86382478
      },
      latest: {
        version: '2.0.0',
        time_diff: 1923164678
      }
    },
    {
      package: 'b',
      local: {
        version: '3.0.0'
      },
      wanted: {
        version: '3.0.0',
        time_diff: 0
      },
      latest: {
        version: '4.0.0',
        time_diff: 11320472695
      }
    }]}

    const jsonfileStub = sinon.stub(jsonfile, 'readFile').resolves(packageObj)
    const parseDependenciesStub = sinon.stub(utils, 'parseDependencies').returns(parsedDependencies)
    const processDependenciesStub = sinon.stub(utils, 'processDependencies')
    processDependenciesStub.onFirstCall().resolves(processedDependency1)
    processDependenciesStub.onSecondCall().resolves(processedDependency2)

    const result = await depstime()

    jsonfileStub.restore()
    parseDependenciesStub.restore()
    processDependenciesStub.restore()

    return expect(result).to.deep.equal(expected)
  })
})