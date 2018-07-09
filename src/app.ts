import * as util from "util"
import { promisify, ignoreError } from "./tools"
import { getNeoTransfers, sendNeoToken } from "./neo/neo"
import { getEthTransfers, sendEthToken } from "./eth/eth"
import { getEosTransfers, sendEosToken } from "./eos/eos"
import { getProcessed, isProcessed, markProcessed } from "./storage";

console.log(`starting oracle...`)

getProcessed().then(() =>
{
	console.log(`connected to storage provider, starting polling...`)

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
			.then(transfers => transfers.filter(trs => !isProcessed(trs.tx))) // skip already processed transactions
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
					
					let next = (cur: ICrossExchangeTransfer) =>
					{
						console.log('next')
						return m(cur)
							.then(val => markProcessed(cur.tx)
								.then(() => val))
					}
					return bcTransfers[bc].reduce(
						(prev, cur) => prev
							.then(x => (console.log(`successfully sent tx#${x}`), next(cur)))
							.catch(err => (console.error(err), next(cur))),
						Promise.resolve()).then(x => console.log(`sent all ${bc.toUpperCase()}`))
				})).then(x => (console.log('sent all transactions'), setTimeout(_poll_, 5000)))
			})
			.catch(err => console.error(err))
	}
}).catch(err => console.error(err))