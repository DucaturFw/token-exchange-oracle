import Web3 from "web3"
import { EventLog } from "web3/types"
import appConfig from "../config"
import r from "rethinkdb"

let ETH_ABI = require('../../data/ducatur-eth.abi.json')

let web3 = new Web3(new Web3.providers.HttpProvider(appConfig.eth.https))

let events = [] as IDBEvent<IExchangeReturn>[]

let connected = false

let dbpromise = r.connect(appConfig.rethink).then(connection =>
{
	return r.db('ethereum').table('contractCalls')
		.orderBy({
			index: r.desc('chronological')
		})
		.filter({
			event:"BlockchainExchange",
			address: appConfig.eth.contractAddr
		}).changes({includeInitial: true}).run(connection)
})

Promise.all([dbpromise, web3.eth.net.isListening()]).then(([cursor, ethConnected]) =>
{
	console.log("connected ETH!")
	connected = true
	
	web3.eth.accounts.wallet.add(appConfig.eth.owner_pk)

	cursor.each<{ new_val: IDBEvent<IExchangeReturn> }>((err, row) =>
	{
		if (err)
			return console.error(err)
		
		events.push(row.new_val)
	})
})
interface IExchangeReturn
{
	0: string
	1: string
	2: string
	3: string
	adr: string
	from: string
	newNetwork: string
	value: string
}
interface IDBEvent<IReturnValues> extends EventLog
{
	id: string
	removed: boolean
	returnValues: IReturnValues
	signature: string
}

function eventToCXTransfer(event: IDBEvent<IExchangeReturn>): ICrossExchangeTransfer
{
	return {
		blockchainFrom: "eth",
		from: event.returnValues[0],
		amount: parseFloat(event.returnValues[1]),
		blockchainTo: bcIdxToName(event.returnValues[2]),
		to: event.returnValues[3],
		tx: event.transactionHash
	}
}
function bcIdxToName(idx: number | string)
{
	idx = idx + ""
	let map = {
		0: "eth",
		1: "neo",
		2: "eos",
		3: "qtum",
		4: "bts"
	}
	return (map as any)[idx]
}

export function getEthTransfers(callback: (err: any, transfers: ICrossExchangeTransfer[] | undefined) => void)
{
	if (connected)
	return callback(undefined, events.map(eventToCXTransfer))
	else
		setTimeout(() => getEthTransfers(callback), 100)
}
export function sendEthToken(transfer: ICrossExchangeTransfer)
{
	// mint ETH tokens
	console.log(`\n\n-----TRANSFER ETH-----\n`)
	console.log(transfer)
	console.log(`\n----------------------\n\n`)
}