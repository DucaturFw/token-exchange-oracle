import "jest-extended"

import { eos, getTableRows, getTokenBalance, callContract } from "./lib"
import Eos, { IEosContract, IEosjsCallsParams } from "eosjs"
import appConfig from "../config"

jest.setTimeout(20000)

it('should connect to testnet', done =>
{
	eos.getInfo((err: any, res: any) =>
	{
		expect(err).toBeFalsy()

		expect(res).toBeDefined()
		
		done()
	})
})

interface IL2dexContract extends IEosContract
{
	open(args: { opener: string,
		pub_key: string,
		respondent: string,
		resp_key: string,
		quantity: string,
		pair: string
	}, extra?: IEosjsCallsParams): Promise<void>

	extend(...args: any[]): Promise<void>
	validate(...args: any[]): Promise<void>
	close(...args: any[]): Promise<void>
	hi(...args: any[]): Promise<void>
}

it('should get contract', done =>
{
	eos.contract('l2dex.code', (err, res) =>
	{
		expect(err).toBeFalsy()
		
		expect(res).toBeDefined()

		expect(res.fc).toBeDefined()
		expect(res.fc.abi).toBeDefined()

		done()
	})
})

it('should open payment channel', done =>
{
	let auth = { authorization: "tester1", sign: true }
	let PK = appConfig.eos.pk
	eos.contract<IL2dexContract>('l2dex.code', auth, (err, res) =>
	{
		expect(err).toBeFalsy()

		res.open({
			opener: 'tester1',
			pub_key: Eos.modules.ecc.privateToPublic(PK),
			pair: "ETH",
			quantity: "1.0000 SYS",
			respondent: 'l2dex.code',
			resp_key: Eos.modules.ecc.privateToPublic(PK),
		}).then(x =>
		{
			// console.log(x)

			done()
		}).catch(err => done(err || "unknown promise error!"))
	})
}, 40000)

it('should call contract', done =>
{
	let auth = { authorization: "tester1", sign: true }
	let PK = appConfig.eos.pk

	let args = {
		opener: 'tester1',
		pub_key: Eos.modules.ecc.privateToPublic(PK),
		pair: "ETH",
		quantity: "1.0000 SYS",
		respondent: 'l2dex.code',
		resp_key: Eos.modules.ecc.privateToPublic(PK),
	}

	callContract<IL2dexContract, typeof args>("l2dex.code", "open", args, auth).then(x =>
	{
		console.log(x)

		done()
	}).catch(done)
}, 40000)

it('should get table data', done =>
{
	getTableRows("l2dex.code", "l2dex.code", "channels").then(x =>
	{
		expect(x).toBeDefined()
		expect(x.rows).toBeDefined()
		expect(x.rows.length).toBeGreaterThan(0)
		// console.log(x.rows[0])
		done()
	}).catch(err => done(err || "unknown promise error!"))
})

it('should read tokens balance', done =>
{
	getTokenBalance("tester1", "SYS").then(balance =>
	{
		expect(balance).toBeNumber()
		expect(balance).toBeGreaterThanOrEqual(0)
		done()
	})
})


interface ITokenContract extends IEosContract
{
	create(...args: any[]): Promise<void>
	issue(args: {
		to: string,
		quantity: string,
		memo: string
	}, extra?: IEosjsCallsParams): Promise<void>
	transfer(args: {
		from: string,
		to: string,
		quantity: string,
		memo: string
	}, extra?: IEosjsCallsParams): Promise<void>
}

it('should mint tokens', done =>
{
	let auth = { authorization: "eosio", sign: true, broadcast: true, debug: true }
	let PK = appConfig.eos.pk

	getTokenBalance("tester1", "SYS").then(oldBalance =>
	{
		expect(oldBalance).toBeNumber()
		eos.contract<ITokenContract>("eosio.token", (err, res) =>
		{
			expect(err).toBeFalsy()
			expect(res).toBeDefined()

			res.issue({
				to: "tester1",
				quantity: "1.0000 SYS",
				memo: `eos.test.${Math.floor(Math.random() * 10000)}`
			}, auth).then(__ =>
			{
				setTimeout(() => getTokenBalance("tester1", "SYS").then(newBalance =>
				{
					expect(newBalance).toBeNumber()
					expect(newBalance).toBeGreaterThan(oldBalance)
					expect(newBalance).toEqual(oldBalance + 1)

					done()

				}), 500)
			})
		})
	})
})