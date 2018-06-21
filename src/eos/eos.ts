import { eos, getTableRows } from "./lib"

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
	getTableRows<IEosExchangeTransfer>("tester3", "tester3", "exchanges").then(res =>
	{
		// console.log(res.rows)

		let transfers = res.rows.map(x => ({
			amount: parseAmount(x.amount).value,
			to: x.to,
			from: x.from,
			tx: x.txid + "",
			blockchainFrom: 'eos',
			blockchainTo: x.blockchain,
		}))
		callback(undefined, transfers)
	})
	.catch(err => callback(err, undefined))
}

export function sendEosToken(transfer: ICrossExchangeTransfer)
{
	// mint EOS tokens
	console.log(`\n\n-----TRANSFER EOS-----\n`)
	console.log(transfer)
	console.log(`\n----------------------\n\n`)
}