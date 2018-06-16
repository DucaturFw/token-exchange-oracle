import { eos, getTableRows } from "./lib"
import Eos, { IEosContract, IEosjsCallsParams } from "eosjs";

it('should connect to testnet', done =>
{
	eos.getInfo((err: any, res: any) =>
	{
		expect(err).toBeFalsy()
		
		done()
	})
}, 20000)

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
}, 20000)

it('should open payment channel', done =>
{
	let auth = { authorization: "tester1", sign: true }
	let PK = require('../../data/config.json').eos.pk
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