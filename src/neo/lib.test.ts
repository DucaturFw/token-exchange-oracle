import "jest-extended"

import { get_last_transactions_by_address, get_transactions, getApplog } from "./lib"
import appConfig from "../config"
import { HALT_BREAK } from "./neo-vm";

describe('neoscan getting info', () =>
{
	it('should get address transactions', done =>
	{
		get_last_transactions_by_address(appConfig.neo.contract.addr, (err, res) =>
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
		get_last_transactions_by_address(appConfig.neo.contract.addr, (err, res) =>
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
describe('applog getting info', () =>
{
	it('should get random app log', done =>
	{
		let txid = "0x28ddfb25e0ca367f3344326fd78b4e34d8f10595057a22cf88de28b41e25f8d0"
		getApplog(txid).then(tx =>
		{
			done()
		})
	})
	it('should get correct app log', done =>
	{
		let txid = `0x14ca7a93fdcf0a515dcef228cea3b1b4dcc35895e14322276166a02785520deb`
		getApplog(txid).then(tx =>
		{
			expect(tx).toBeDefined()
			expect(tx.txid).toEqual(txid)
			expect(tx.vmstate).toEqual(HALT_BREAK)
			expect(tx.stack).toBeArray()
			expect(tx.stack).not.toBeEmpty()
			let ret = tx.stack.pop()
			expect(ret).toBeDefined()
			if (!ret)
				return done("ret is null")
			expect(ret.type).toEqual("Integer")
			expect(ret.value).toEqual("1")

			done()
		})
	})
})