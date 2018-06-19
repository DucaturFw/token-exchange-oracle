import * as util from "util"
import { promisify, ignoreError } from "./tools"
import { getNeoTransfers, sendNeoToken } from "./neo/neo"
import { sendEthToken, getEthTransfers } from "./eth/eth"

let processed: { [tx: string]: boolean } = { }

setInterval(_poll_, 1000)

function _poll_()
{
	console.log("poll")

	let processors = {
		eth: sendEthToken,
		neo: sendNeoToken,
	} as { [bc: string]: (tx: ICrossExchangeTransfer) => void }

	Promise.all([
		ignoreError(promisify(getNeoTransfers), [], err => console.log(`neo transfers couldn't be loaded: ${err}`)),
		ignoreError(promisify(getEthTransfers), [], err => console.log(`eth transfers couldn't be loaded: ${err}`)),
	])
		.then(_ => (console.log(_), _))
		.then((results) => results.reduce((acc, val) => acc.concat(val), [])) // flatten results
		.then(transfers => transfers.filter(trs => !processed[trs.tx])) // skip already processed transactions
		.then(transfers =>
		{
			transfers.forEach(tx =>
			{
				let p = processors[tx.blockchainTo]
				if (!p)
					return console.error(`no such target blockchain! ${tx.blockchainTo}`)
				
				processed[tx.tx] = true
				return p(tx)
			})
		})
		.catch(err => console.error(err))
}