import Neon, { u as neon_u } from "@cityofzion/neon-js"

import appConfig from "../config"

import { get_last_transactions_by_address, getTxsWithLogs } from "./lib"
import { parseExchangeCall, checkTxSuccess } from "./neo-vm"
import { toScriptString, ctrInvoker, invoke, signRawTx } from "./tools"

export let NEO_CONTRACT_ADDR = appConfig.neo.contract.addr

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
						
						if (!log)
							return console.log(`skipping tx #${tx.txid} without applog!`)
						
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

	let neoscan = `${appConfig.neo.apiUrl}/api/main_net`

	let ctrHash = appConfig.neo.contract.hash

	let makeScript = toScriptString(ctrHash)
	let callContract = ctrInvoker(ctrHash, appConfig.neo.rpc)
	let to = Neon.create.account(transfer.to)
	console.log(transfer.to)
	console.log(to.scriptHash)
	callContract = (op: string, ...args: any[]) =>
		invoke(
			signRawTx(
				appConfig.neo.contract.owner_pk,
				makeScript(op, args)
			).serialize(true),
			appConfig.neo.rpc
		)
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
		neon_u.num2fixed8(transfer.amount),
		neon_u.str2hexstring(transfer.blockchainFrom),
		neon_u.str2hexstring(transfer.tx)
	)).then(x => (console.log(x), console.log(x.tx && x.tx.scripts))).catch(_err_)
}

function _err_(arg: any)
{
	console.log(`error:`)
	console.error(arg)
	if (arg && arg.result && arg.result.stack)
		console.error(arg.result.stack)
}