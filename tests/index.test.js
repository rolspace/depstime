import * as chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import sinon from 'sinon'
import { run } from '../src/index.js'

chai.use(chaiAsPromised)
const { expect } = chai

describe('index.js', () => {
  afterEach(() => {
    sinon.restore()
  })

  it('Cannot find package.json file, should reject', async () => {
    const readPackageFileFake = sinon.fake.rejects()

    const result = run(null, null, { readPackageFile: readPackageFileFake })

    await expect(result).to.be.rejected
  })

  it('No dependencies found in package.json file, should reject with a specific error', async () => {
    const packageObj = {
      name: 'depstime',
    }

    const readPackageFileFake = sinon.fake.resolves(packageObj)

    const result = run(null, null, { readPackageFile: readPackageFileFake })

    await expect(result).to.be.rejectedWith(
      'There are no dependencies in the package.json file.',
    )
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

    const firstCreatedDepstime = {
      package: 'a',
      local: {
        version: '^1.2.1',
      },
    }
    const secondCreatedDepstime = {
      package: 'b',
      local: {
        version: '3.0.0',
      },
    }

    const firstProcessedDepstime = {
      name: 'a',
      local: {
        version: '^1.2.1',
      },
      wanted: {
        version: '1.2.2',
        timeDeltaToLocal: 86382478,
      },
      latest: {
        version: '2.0.0',
        timeDeltaToLocal: 1923164678,
      },
    }
    const secondProcessedDepstime = {
      name: 'b',
      local: {
        version: '3.0.0',
      },
      wanted: {
        version: '3.0.0',
        timeDeltaToLocal: 0,
      },
      latest: {
        version: '4.0.0',
        timeDeltaToLocal: 11320472695,
      },
    }

    const expected = {
      dependencies: [
        {
          name: 'a',
          local: {
            version: '^1.2.1',
          },
          wanted: {
            version: '1.2.2',
            timeDeltaToLocal: 86382478,
          },
          latest: {
            version: '2.0.0',
            timeDeltaToLocal: 1923164678,
          },
        },
        {
          name: 'b',
          local: {
            version: '3.0.0',
          },
          wanted: {
            version: '3.0.0',
            timeDeltaToLocal: 0,
          },
          latest: {
            version: '4.0.0',
            timeDeltaToLocal: 11320472695,
          },
        },
      ],
    }

    const readPackageFileFake = sinon.fake.resolves(packageObj)
    const createDepstimeStub = sinon.stub()
    createDepstimeStub.onFirstCall().returns(firstCreatedDepstime)
    createDepstimeStub.onSecondCall().returns(secondCreatedDepstime)

    const processDepstimesStub = sinon.stub()
    processDepstimesStub.onFirstCall().resolves(firstProcessedDepstime)
    processDepstimesStub.onSecondCall().resolves(secondProcessedDepstime)

    const result = await run(null, null, {
      readPackageFile: readPackageFileFake,
      createDepstime: createDepstimeStub,
      processDepstimes: processDepstimesStub,
    })

    expect(result).to.deep.equal(expected)
  })
})
