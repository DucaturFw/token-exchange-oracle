import appConfig from "../config"

import { get_last_transactions_by_address, getTxsWithLogs } from "./lib"
import { parseExchangeCall, checkTxSuccess } from "./neo-vm"

export let NEO_CONTRACT_ADDR = appConfig.neo.contractAddr

export function getNeoTransfers(callback: (err: any, transfers: ICrossExchangeTransfer[] | undefined) => void)
{
	get_last_transactions_by_address(NEO_CONTRACT_ADDR, (err, txs) =>
		{
			if (err)
				return callback(err, undefined)
			
			if (!txs)
				return callback("undefined transaction list!", undefined)

			txs = txs.filter(x => x.type == "InvocationTransaction")

			getTxsWithLogs(txs.map(tx => tx.txid))
				.then((txs) =>
				{
					let ethTransfers: ICrossExchangeTransfer[] = []
					txs.forEach(({ tx, log }) =>
					{
						if (!tx.script)
							return
						
						// console.log(tx)

						let contract = parseExchangeCall(tx.script)
						if (!contract || contract.method != "exchange")
							return
						
						if (!checkTxSuccess(log)) // failed transaction (shouldn't be in the blockchain anyway)
							return
						
						let [from, amount, blockchainTo, to] = contract.params as [string, number, string, string]
						blockchainTo = blockchainTo.toLowerCase()
						ethTransfers.push({
							from,
							to,
							amount,
							tx: tx.txid,
							blockchainFrom: "neo",
							blockchainTo,
						})
					})
					return callback(undefined, ethTransfers)
				})
				.catch(err => callback(err, undefined))
		})
}
export function sendNeoToken(transfer: ICrossExchangeTransfer)
{
	// mint NEO tokens
	console.log(`\n\n-----TRANSFER NEO-----\n`)
	console.log(transfer)
	console.log(`\n----------------------\n\n`)
}