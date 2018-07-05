import * as util from "util"
import { promisify, ignoreError } from "./tools"
import { getNeoTransfers, sendNeoToken } from "./neo/neo"
import { getEthTransfers, sendEthToken } from "./eth/eth"
import { getEosTransfers, sendEosToken } from "./eos/eos"

let processed: { [tx: string]: boolean } = {
	'b1b0b7dc1a0b36bf8a2073f2406463aa65516deb131261462b8b7a36deb1f8f6': true,
	'b2daa1fefd2ae1d0d3896525c9b9b0d07ac24b2547c43d6fb8ec9e35d3f1428a': true,
	'3a95624ad301c3dcecd1401f87fae7d8b7d1ed887da7ae2f67f549fb668252f1': true,
	"7794a22afda0750fc25ca05ed4d0442346d89595670a75ca7dfdb9dd365b7126": true,
	"0": true,
	"1": true,
	"2": true,
	"3": true,
	"4": true,
	"5": true,
	"6": true,
	"7": true,
	"8": true,
	// "1": true,
	"0x74ab1dec2b138e8292edd33b3f82747968f9f8c70fa34889e181dbba932af4ed": true,
	"0x9cdc1bab13ff6abbf47155e6a745024c52c4a18d834952728ee7ab54bd1d52ed": true,
}

_poll_()

function _poll_()
{
	console.log("poll " + new Date().toISOString())

	let processors = {
		eth: sendEthToken,
		// neo: sendNeoToken,
		eos: sendEosToken,
	} as { [bc: string]: (tx: ICrossExchangeTransfer) => Promise<any> }

	Promise.all([
		// ignoreError(promisify(getNeoTransfers), [], err => console.log(`neo transfers couldn't be loaded: ${err}`)),
		ignoreError(promisify(getEthTransfers), [], err => console.log(`eth transfers couldn't be loaded: ${err}`)),
		ignoreError(promisify(getEosTransfers), [], err => console.log(`eos transfers couldn't be loaded: ${err}`)),
	])
		// .then(_ => (console.log(_), _))
		.then((results) => results.reduce((acc, val) => acc.concat(val), [])) // flatten results
		.then(transfers => transfers.filter(trs => !processed[trs.tx])) // skip already processed transactions
		.then(transfers =>
		{
			// console.log(transfers)
			let bcTransfers = transfers.reduce((acc, tx) =>
			{
				if (isNaN(tx.amount) || tx.amount <= 0)
					return console.error(`tx amount is <= 0!`), console.error(tx), acc

				let toBlock = (tx.blockchainTo || "").toLowerCase()
				
				;(acc[toBlock] || (acc[toBlock] = [])).push(tx)
				
				return acc
			}, {} as {[key: string]: ICrossExchangeTransfer[]})
			
			Promise.all(Object.keys(bcTransfers).map(bc =>
			{
				let m = processors[bc]
				if (!m)
					return console.error(`no such target blockchain! ${bc}`), Promise.resolve()
				
				let next = (cur: ICrossExchangeTransfer) => (console.log('next'), processed[cur.tx] = true, m(cur))
				return bcTransfers[bc].reduce(
					(prev, cur) => prev
						.then(x => (console.log(`successfully sent tx#${x}`), next(cur)))
						.catch(err => (console.error(err), next(cur))),
					Promise.resolve()).then(x => console.log(`sent all ${bc.toUpperCase()}`))
			})).then(x => (console.log('sent all transactions'), setTimeout(_poll_, 1000)))
		})
		.catch(err => console.error(err))
}