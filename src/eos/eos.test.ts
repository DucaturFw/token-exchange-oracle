import "jest-extended"

import * as _lib from "./lib"
let lib = require("./lib") as typeof _lib

import { getEosTransfers } from "./eos"

describe('getEosTransfers with mocked getTableRows', () =>
{
	it('should parse empty mocked data', done =>
	{
		lib.getTableRows = jest.fn(() => Promise.resolve({ rows: [] }))
		getEosTransfers((err: any, transfers: any) =>
		{
			expect(lib.getTableRows).toHaveBeenCalledTimes(1)
			expect(err).toBeFalsy()
			
			expect(transfers).toBeDefined()
			if (!transfers)
				return
			
			expect(transfers).toBeEmpty()
			expect(transfers).toBeArrayOfSize(0)
			
			done()
		})
	})
	it('should parse mocked data', done =>
	{
		let MOCKED_DATA = [{
			id: 0,
			from: 'tester2',
			to: '0x12345678',
			amount: '50.0000 DUC',
			blockchain: 'eth',
			pubtime: '2018-06-19T17:05:34',
			exchanged: 0
		}]
		lib.getTableRows = jest.fn(() => Promise.resolve({ rows: MOCKED_DATA }))
		getEosTransfers((err, transfers) =>
		{
			expect(lib.getTableRows).toHaveBeenCalledTimes(1)
			expect(err).toBeFalsy()
			
			expect(transfers).toBeDefined()
			if (!transfers)
				return
			
			expect(transfers).toBeArrayOfSize(1)
			expect(transfers[0]).toMatchObject({
				amount: expect.any(Number),
				blockchainFrom: "eos",
				blockchainTo: "eth",
				from: "tester2",
				to: "0x12345678"
			} as typeof transfers[0])
			expect(transfers[0].amount).toBeCloseTo(50)

			done()
		})
	})
})