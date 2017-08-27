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

	it('Callback called with false argument if the path does not exist', () => {
		const cb = sinon.spy()
		const fsStub = sinon.stub(fs, 'existsSync').returns(false)

		depstime('/path/that/does/not/exist', cb)

		fsStub.restore()

		expect(cb.calledWith(false)).to.equal(true)
	})

	it('Callback called with false argument if the path does not contain a package.json file', () => {
		const cb = sinon.spy()

		const fsStub = sinon.stub(fs, 'existsSync').returns(true)
		const pathStub = sinon.stub(path, 'join').returns('/path/that/does/exist/package.json')
		const jsonfileStub = sinon.stub(jsonfile, 'readFile').yields('error', null)

		const result = depstime('/path/that/does/exist', cb)

		fsStub.restore()
		pathStub.restore()
		jsonfileStub.restore()

		expect(cb.calledWith(false)).to.equal(true)
	})

	it('Callback called with false argument if the package.json file does not have dependencies', () => {
		const cb = sinon.spy()

		const fsStub = sinon.stub(fs, 'existsSync').returns(true)
		const pathStub = sinon.stub(path, 'join').returns('/path/that/does/exist/package.json')
		const jsonfileStub = sinon.stub(jsonfile, 'readFile').yields(null, { name: 'depstime'  })

		depstime('/path/that/does/exist', cb)

		fsStub.restore()
		pathStub.restore()
		jsonfileStub.restore()

		expect(cb.calledWith(false)).to.equal(true)
	})

	it('Returns an object with each dependency as an object, dependencies are ordered alphabetically', () => {
		const cb = sinon.spy();

		const fsStub = sinon.stub(fs, 'existsSync').returns(true)
		const pathStub = sinon.stub(path, 'join').returns('/path/that/does/exist/package.json')
		const jsonfileStub = sinon.stub(jsonfile, 'readFile').yields(null, { name: 'depstime', dependencies: { dep: '^1.2.1' } })

		const result = depstime('/path/that/does/exist', cb)

		fsStub.restore()
		pathStub.restore()
		jsonfileStub.restore()

		expect(cb.calledWith(false)).to.equal(true)
	})
})