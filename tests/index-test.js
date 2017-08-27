import fs from 'fs'
import path from 'path'
import jsonfile from 'jsonfile'
import { Console } from 'console'
import { expect } from 'chai';
import sinon from 'sinon';
import depstime from '../dist/index'

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

	it('Returns false if the path parameter does not exist', () => {
		const fsStub = sinon.stub(fs, 'existsSync').returns(false)

		const result = depstime('/path/that/does/not/exist', null)

		fsStub.restore()

		expect(result).to.equal(false)
	})

	it('Returns false if the path does not contain a package.json file', () => {
		const fsStub = sinon.stub(fs, 'existsSync').returns(true)
		const pathStub = sinon.stub(path, 'join').returns('/path/that/does/exist/package.json')
		const jsonfileStub = sinon.stub(jsonfile, 'readFile').yields('error', null)

		const result = depstime('/path/that/does/exist', null)

		fsStub.restore()
		pathStub.restore()
		jsonfileStub.restore()

		expect(result).to.equal(false)
	})

	it('Returns false if the package.json file does not have dependencies', () => {
		const fsStub = sinon.stub(fs, 'existsSync').returns(true)
		const pathStub = sinon.stub(path, 'join').returns('/path/that/does/exist/package.json')
		const jsonfileStub = sinon.stub(jsonfile, 'readFile').yields(null, { "name": "depstime"  })

		const result = depstime('/path/that/does/exist', null)

		fsStub.restore()
		pathStub.restore()
		jsonfileStub.restore()

		expect(result).to.equal(false)
	})
})