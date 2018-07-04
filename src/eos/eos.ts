import { eos, getTableRows, callContract } from "./lib"

import appConfig from "../config"
import { IEosContract } from "eosjs"

interface IEosExchangeTransfer
{
	id: number
	from: string
	to: string
	amount: string
	blockchain: string
	pubtime: string
	txid: string
}

let CONTRACT_ADDR = appConfig.eos.contract.addr

export function parseAmount(amount: string): { value: number, symbol: string }
{
	let [value, symbol] = amount.split(' ') as [any, string]
	value = parseFloat(value as any)
	return {
		value,
		symbol
	}
}

export function getEosTransfers(callback: (err: any, transfers: ICrossExchangeTransfer[] | undefined) => void)
{
	getTableRows<IEosExchangeTransfer>(CONTRACT_ADDR, CONTRACT_ADDR, "exchanges").then(res =>
	{
		// console.log(res.rows)
		let txs = res.rows
		txs = txs
			.filter(x => !x.txid) // already processed
			.filter(x => parseFloat(x.amount) > 0) // incorrect amount (is this possible anyway?)
			.filter(x => ["eth", "neo"].includes(x.blockchain.toLowerCase())) // incorrect blockchain (should we care?)

		let transfers = txs.map(x => ({
			amount: parseAmount(x.amount).value,
			to: x.to,
			from: x.from,
			tx: x.id + "",
			blockchainFrom: 'eos',
			blockchainTo: x.blockchain.toLowerCase(),
		}))
		callback(undefined, transfers)
	})
	.catch(err => callback(err, undefined))
}

interface ITransferArgs
{
	token_master: string
	to: string
	quantity: string
	memo: string
}
interface IEosExchangeContract extends IEosContract
{
	exchange(args: {
		from: string
		quantity: string
		blockchain: string
		to: string
	}): Promise<void>
	expired(args: {
		id: string
	}): Promise<void>
	// void close(const uint64_t &id, const std::string &txid)
	transfer(args: ITransferArgs): Promise<void>
}

export function sendEosToken(transfer: ICrossExchangeTransfer)
{
	// mint EOS tokens
	console.log(`\n\n-----TRANSFER EOS-----\n`)
	console.log(transfer)
	console.log(`\n----------------------\n\n`)

	// return

	let args: ITransferArgs = {
		to: transfer.to,
		token_master: appConfig.eos.contract.owner,
		quantity: `${transfer.amount.toFixed(4)} DUC`,
		memo: transfer.tx
	}
	let extra = {
		authorization: appConfig.eos.contract.owner,
		sign: true,
		broadcast: true,
	}

	callContract<IEosExchangeContract, ITransferArgs>(appConfig.eos.contract.addr, "transfer", args, extra).then(x =>
	{
		console.log(x)
	}).catch(err => console.error(err))
}