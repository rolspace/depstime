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

	it('Callback called with false argument if the path does not exist', () => {
		const fsStub = sinon.stub(fs, 'existsSync').returns(false)

		const result = depstime('/path/that/does/not/exist')

		fsStub.restore()

		return expect(result).to.be.rejected.and.to.eventually.equal(false)
	})

	it('Callback called with false argument if the path does not contain a package.json file', () => {
		const fsStub = sinon.stub(fs, 'existsSync').returns(true)
		const pathStub = sinon.stub(path, 'join').returns('/path/that/does/exist/package.json')
		const jsonfileStub = sinon.stub(jsonfile, 'readFile').yields('error', null)

		const result = depstime('/path/that/does/exist')

		fsStub.restore()
		pathStub.restore()
		jsonfileStub.restore()

		return expect(result).to.be.rejected.and.to.eventually.equal(false)
	})

	it('Callback called with false argument if the package.json file does not have dependencies', () => {
		const fsStub = sinon.stub(fs, 'existsSync').returns(true)
		const pathStub = sinon.stub(path, 'join').returns('/path/that/does/exist/package.json')
		const jsonfileStub = sinon.stub(jsonfile, 'readFile').yields(null, { name: 'depstime'  })

		const result = depstime('/path/that/does/exist')

		fsStub.restore()
		pathStub.restore()
		jsonfileStub.restore()

		return expect(result).to.be.rejected.and.to.eventually.equal(false)
	})

	it('Returns an object with each dependency as an object, dependencies are ordered alphabetically', () => {
		const packageJson = {
			name: 'depstime',
			dependencies: {
				dep1: '^1.2.1'
			},
			devDependencies: {
				version: '3.0.0'
			}
		}

		const fsStub = sinon.stub(fs, 'existsSync').returns(true)
		const pathStub = sinon.stub(path, 'join').returns('/path/that/does/exist/package.json')
		const jsonfileStub = sinon.stub(jsonfile, 'readFile').yields(null, packageJson)

		const expected = {
			dep: {
				version: '^1.2.1'
			},
			devDep: {
				version: '3.0.0'
			}
		}

		const result = depstime('/path/that/does/exist')

		fsStub.restore()
		pathStub.restore()
		jsonfileStub.restore()

		return expect(result).to.be.fulfilled.and.to.eventually.deep.equal(expected)
	})
})