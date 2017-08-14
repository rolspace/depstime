import fs from 'fs'
import path from 'path'
import { Console } from 'console'
import { expect } from 'chai';
import sinon from 'sinon';
import depstime from '../dist/index'

describe('depstime', () => {
	it('Outputs an error message if the path parameter does not exist', () => {
		const fsStub = sinon.stub(fs, 'existsSync').returns(false)
		const logWriterSpy = sinon.stub(Console.prototype, 'error').callsFake(() => { })

		depstime('/path/that/does/not/exist', null)

		fsStub.restore()
		logWriterSpy.restore()

		expect(logWriterSpy.calledOnce).to.equal(true)
	})

	it('Outputs an error message if the path does not contain a package.json file', () => {
		const fsExistsStub = sinon.stub(fs, 'existsSync').returns(true)
		const fsOpenStub = sinon.stub(fs, 'open').yields('error', null)
		const pathStub = sinon.stub(path, 'join').returns('/path/that/does/exist/package.json')

		const logWriterSpy = sinon.stub(Console.prototype, 'error').callsFake(() => { })

		depstime('/path/that/does/exist', null)

		fsExistsStub.restore()
		fsOpenStub.restore()
		pathStub.restore()
		logWriterSpy.restore()

		expect(logWriterSpy.calledOnce).to.equal(true)
	})
})