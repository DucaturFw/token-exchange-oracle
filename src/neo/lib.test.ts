import "jest-extended"

import { get_last_transactions_by_address, get_transactions } from "./lib"
import appConfig from "../config"

describe('neoscan getting info', () =>
{
	it('should get address transactions', done =>
	{
		get_last_transactions_by_address(appConfig.neo.contractAddr, (err, res) =>
		{
			expect(err).toBeFalsy()
			expect(res).toBeArray()

			if (!res)
				throw "undefined transaction result!"

			res.map(x => expect(x.txid).toBeString())
			
			done()
		})
	})
	it('should get transactions list', done =>
	{
		get_last_transactions_by_address(appConfig.neo.contractAddr, (err, res) =>
		{
			expect(err).toBeFalsy()
			expect(res).toBeArray()

			if (!res)
				throw "never"
			
			expect(res.length).toBeGreaterThan(0)
			
			get_transactions(res.map(x => x.txid)).then(txs =>
			{
				expect(txs).toBeArray()
				expect(txs.length).toBeGreaterThan(0)
				expect(txs.length).toEqual(res.length)
				
				txs.map(x => expect(x).toMatchObject({ txid: expect.any(String), script: expect.any(String) }))

				done()
			})
		})
	})
})