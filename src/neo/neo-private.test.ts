import Neon, { u as neon_u } from "@cityofzion/neon-js"

import appConfig from "../config"

import { toScriptString, ctrInvoker, invoke, signRawTx } from "./tools"
import { get_last_transactions_by_address, getTxsWithLogs } from "./lib"

describe('misc contract calls', () =>
{
	it('should convert script hash', () =>
	{
		let SH = 'fe4e4818cd6f32d43315b373f3562d284625dc8a'
		let acc = Neon.create.account(SH)
		expect(acc.address).toEqual('AUS6cxNXfxPQ3jAFZQkH8YvruspBkVwX28')
	})
	it('should load contract data', done =>
	{
		let SH = 'fe4e4818cd6f32d43315b373f3562d284625dc8a'
		let acc = Neon.create.account(SH)
		// console.log(acc.address)
		get_last_transactions_by_address(acc.address, (err, res) =>
		{
			if (err)
				return done(err)
			
			expect(res).toBeDefined()
			expect(res).toBeArray()
			expect(res).not.toBeEmpty()

			if (!res)
				return
			
			console.log(res)
			done()
		})
	})
	it('should send tx', done =>
	{
		let SH = 'fe4e4818cd6f32d43315b373f3562d284625dc8a'
		let acc = Neon.create.account(SH)
		let neoscan = `${appConfig.neo.apiUrl}/api/main_net`
		let makeScript = toScriptString(SH)
		let to = Neon.create.account('AWLYWXB8C9Lt1nHdDZJnC5cpYJjgRDLk17')
		console.log(to.address)
		console.log(to.scriptHash)
		
		function sendTx(script: string)
		{
			return Neon.doInvoke({
				net: neoscan,
				url: appConfig.neo.rpc,
				script: script,
				account: Neon.create.account(appConfig.neo.contract.owner_pk),
				gas: 0.001,
			}).then(tx => tx)
		}
		sendTx(makeScript('mintTokens',
			neon_u.reverseHex(to.scriptHash),
			neon_u.num2fixed8(1),
			neon_u.str2hexstring("eth"),
			neon_u.str2hexstring("0x12345678")
		)).then(x => (console.log(x), console.log(x.tx && x.tx.scripts), done())).catch(done)
	})
})