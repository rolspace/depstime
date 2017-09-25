import fs from 'fs'
import path from 'path'
import jsonfile from 'jsonfile'
import { Console } from 'console'
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised'
import sinon from 'sinon';
import depstime from '../dist/index'

chai.use(chaiAsPromised)
const expect = chai.expect

describe('depstime', () => {
	let loggerInfoStub, loggerErrorStub

	beforeEach(() => {
			loggerInfoStub = sinon.stub(Console.prototype, 'info').callsFake(() => { })
			loggerErrorStub = sinon.stub(Console.prototype, 'error').callsFake(() => { })
		})

	afterEach(() => {
		loggerInfoStub.restore()
		loggerErrorStub.restore()
	})

	it('is rejected if the path does not exist', () => {
		const fsStub = sinon.stub(fs, 'existsSync').returns(false)

		const result = depstime('/path/that/does/not/exist')

		fsStub.restore()

		return expect(result).to.be.rejected.and.to.eventually.equal(false)
	})

	it('is rejected if the path does not contain a package.json file', () => {
		const fsStub = sinon.stub(fs, 'existsSync').returns(true)
		const pathStub = sinon.stub(path, 'join').returns('/path/that/does/exist/package.json')
		const jsonfileStub = sinon.stub(jsonfile, 'readFile').yields('error', null)

		const result = depstime('/path/that/does/exist')

		fsStub.restore()
		pathStub.restore()
		jsonfileStub.restore()

		return expect(result).to.be.rejected.and.to.eventually.equal(false)
	})

	it('is rejected if the package.json file does not have dependencies', () => {
		const fsStub = sinon.stub(fs, 'existsSync').returns(true)
		const pathStub = sinon.stub(path, 'join').returns('/path/that/does/exist/package.json')
		const jsonfileStub = sinon.stub(jsonfile, 'readFile').yields(null, { name: 'depstime'  })

		const result = depstime('/path/that/does/exist')

		fsStub.restore()
		pathStub.restore()
		jsonfileStub.restore()

		return expect(result).to.be.rejected.and.to.eventually.equal(false)
	})

	it('is resolved with an object containing the dependencies as keys', () => {
		const packageJson = {
			name: 'depstime',
			dependencies: {
				b: '^1.2.1'
			},
			devDependencies: {
				a: '3.0.0'
			}
		}

		const fsStub = sinon.stub(fs, 'existsSync').returns(true)
		const pathStub = sinon.stub(path, 'join').returns('/path/that/does/exist/package.json')
		const jsonfileStub = sinon.stub(jsonfile, 'readFile').yields(null, packageJson)

		const expected = {
			a: {
				version: '3.0.0'
			},
			b: {
				version: '^1.2.1'
			}
		}

		const result = depstime('/path/that/does/exist')

		fsStub.restore()
		pathStub.restore()
		jsonfileStub.restore()

		return expect(result).to.be.fulfilled.and.to.eventually.deep.equal(expected)
	})

	it('is resolved with an object containing the ordered dependencies as keys', () => {
		const packageJson = {
			name: 'depstime',
			dependencies: {
				b: '^1.2.1'
			},
			devDependencies: {
				a: '3.0.0'
			}
		}

		const fsStub = sinon.stub(fs, 'existsSync').returns(true)
		const pathStub = sinon.stub(path, 'join').returns('/path/that/does/exist/package.json')
		const jsonfileStub = sinon.stub(jsonfile, 'readFile').yields(null, packageJson)

		const expected = {
			a: {
				version: '3.0.0'
			},
			b: {
				version: '^1.2.1'
			}
		}

		const result = depstime('/path/that/does/exist')

		fsStub.restore()
		pathStub.restore()
		jsonfileStub.restore()

		return Promise.resolve(result)
			.then(value => {
				expect(Object.keys(value)).to.have.ordered.members(Object.keys(expected))
			})
	})
})