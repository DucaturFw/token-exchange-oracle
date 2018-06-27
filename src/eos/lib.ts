import Eos, { IEosjsCallsParams, IEosContract } from "eosjs"
import confjs from "../config"

console.assert(confjs.eos.pk, "pk not found in config")
console.assert(confjs.eos.rpc, "rpc not found in config")

let config = {
	chainId: confjs.eos.chainId, // 32 byte (64 char) hex string
	// chainId: null,
	keyProvider: confjs.eos.pk, // WIF string or array of keys..
	httpEndpoint: confjs.eos.rpc,
	// mockTransactions: () => 'pass', // or 'fail'
	/* transactionHeaders: (expireInSeconds: any, callback: (error: any, headers: any)) => {
		callback(undefined, headers)
	}, */
	expireInSeconds: 60,
	broadcast: false,
	// debug: false, // API and transactions
	// debug: true,
	sign: true,
}

export let eos = Eos(config)

export function getTableRows<T>(code: string, scope: string, table: string, json: boolean = true)
{
	return eos.getTableRows<T>({
		code,
		scope,
		table,
		json: json.toString()
	})
}

export let getTokenBalance = (account: string, tokenName: string = "SYS") =>
	getTableRows<{ balance: string }>("eosio.token", account, "accounts")
		.then(res => res.rows
			.map(x => x.balance)
			.filter(x => x && x.endsWith(tokenName))
			.map(x => parseFloat(x.substr(0, x.length - 3)))[0] || 0)
type IProp<T> = T[keyof T]
type IMethod<TArgs, TRes> = (args: TArgs, extra?: IEosjsCallsParams) => Promise<TRes>

export function callContract<TContract extends IEosContract, TArgs>(contract: string, method: keyof TContract, args: TArgs, extra: IEosjsCallsParams): Promise<any>
{
	return new Promise((resolve, reject) =>
	{
		eos.contract<TContract>(contract, extra, (err, res) =>
		{
			if (err)
				return reject(err)

			let m = res[method] as IProp<TContract> & IMethod<TArgs, any>

			return m(args, extra).then(resolve).catch(reject)
		})
	})
}