import fs from 'fs'
import path from 'path'
import jsonfile from 'jsonfile'
import child_process from 'child_process'
import mockSpawn from 'mock-spawn'
import { Console } from 'console'
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised'
import sinon from 'sinon';
import depstime from '../dist/index'

chai.use(chaiAsPromised)
const expect = chai.expect

describe('depstime', () => {
	it('is rejected if the path does not exist', () => {
		const fsStub = sinon.stub(fs, 'existsSync').returns(false)

		const result = depstime('/path/that/does/not/exist')

		fsStub.restore()

		return expect(result).to.be.rejected
	})

	it('is rejected if the path does not contain a package.json file', () => {
		const fsStub = sinon.stub(fs, 'existsSync').returns(true)
		const pathStub = sinon.stub(path, 'join').returns('/path/that/does/exist/package.json')
		const jsonfileStub = sinon.stub(jsonfile, 'readFile').yields('error', null)

		const result = depstime('/path/that/does/exist')

		fsStub.restore()
		pathStub.restore()
		jsonfileStub.restore()

		return expect(result).to.be.rejected
	})

	it('is rejected if the path does not contain a package.json file, even if the directory parameter is not provided', () => {
		const fsStub = sinon.stub(fs, 'existsSync').returns(true)
		const pathStub = sinon.stub(path, 'join').returns('/path/that/does/exist/package.json')
		const jsonfileStub = sinon.stub(jsonfile, 'readFile').yields('error', null)

		const result = depstime()

		fsStub.restore()
		pathStub.restore()
		jsonfileStub.restore()

		return expect(result).to.be.rejected
	})

	it('is rejected if the package.json file does not have dependencies', () => {
		const fsStub = sinon.stub(fs, 'existsSync').returns(true)
		const pathStub = sinon.stub(path, 'join').returns('/path/that/does/exist/package.json')
		const jsonfileStub = sinon.stub(jsonfile, 'readFile').yields(null, { name: 'depstime'  })

		const result = depstime('/path/that/does/exist')

		fsStub.restore()
		pathStub.restore()
		jsonfileStub.restore()

		return expect(result).to.be.rejected
	})

	it('is resolved with an object containing the dependency time data as an array', () => {
		const packageJson = {
			name: 'depstime',
			dependencies: {
				b: '^1.2.1'
			},
			devDependencies: {
				a: '3.0.0'
			}
		}

		const expected = { 'dependencies': [{
      name: 'b',
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
      name: 'a',
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

		const fsStub = sinon.stub(fs, 'existsSync').returns(true)
		const pathStub = sinon.stub(path, 'join').returns('/path/that/does/exist/package.json')
		const jsonfileStub = sinon.stub(jsonfile, 'readFile').yields(null, packageJson)

		const localSpawn = mockSpawn()
		child_process.spawn = localSpawn

		const firstSpawnData = {
			name: 'b',
			version: '2.0.0',
			versions: [ '1.2.1', '1.2.2', '2.0.0' ],
			time: {
				'1.2.1': '2017-09-10T21:25:07.758Z',
				'1.2.2': '2017-09-11T21:24:50.236Z',
				'2.0.0': '2017-10-03T03:37:52.436Z'
			}
		}

		const secondSpawnData = {
			name: 'a',
			version: '4.0.0',
			versions: [ '3.0.0', '4.0.0' ],
			time: {
				'3.0.0': '2017-04-07T15:19:52.346Z',
				'4.0.0': '2017-08-16T15:54:25.041Z'
			}
	  }

		localSpawn.sequence.add(localSpawn.simple(0, JSON.stringify(firstSpawnData)))
		localSpawn.sequence.add(localSpawn.simple(0, JSON.stringify(secondSpawnData)))

		const result = depstime('/path/that/does/exist')

		fsStub.restore()
		pathStub.restore()
		jsonfileStub.restore()

		return expect(result).to.be.fulfilled.and.to.eventually.deep.equal(expected)
	})
})