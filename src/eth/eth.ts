import Web3 from "web3"
import { EventLog, Contract, Account } from "web3/types"
import appConfig from "../config"
import r from "rethinkdb"
import validator from "wallet-address-validator"

const ETH_ABI = require('../../data/ducatur-eth.abi.json')

let web3: Web3
let CONTRACT: Contract
let SENDER: Account
let events = [] as IDBEvent<IExchangeReturn>[]

export function init()
{
	if (web3)
		return
	
	web3 = new Web3(new Web3.providers.HttpProvider(appConfig.eth.https))

	r.connect(appConfig.rethink).then(connection =>
	{
		console.log("connected ETH!")
		CONTRACT = new web3.eth.Contract(ETH_ABI, appConfig.eth.contractAddr)
		SENDER = web3.eth.accounts.privateKeyToAccount(appConfig.eth.owner_pk)
		web3.eth.accounts.wallet.add(SENDER)
		
		r.db('ethereum').table('contractCalls')
			.orderBy({
				index: r.desc('chronological')
			})
			.filter({
				event: "BlockchainExchange",
				address: appConfig.eth.contractAddr
			})
			.changes({includeInitial: true})
			.run(connection)
			.then(cursor =>
			{
				cursor.each<{ new_val: IDBEvent<IExchangeReturn> }>((err, row) =>
				{
					if (err)
						return console.error(err)
					
					events.push(row.new_val)
				})
			})
	})
}
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

export function eventToCXTransfer(event: IDBEvent<IExchangeReturn>): ICrossExchangeTransfer
{
	return {
		blockchainFrom: "eth",
		from: event.returnValues[0],
		amount: parseFloat(event.returnValues[1]) / 1e18,
		blockchainTo: bcIdxToName(event.returnValues[2]),
		to: web3.utils.hexToAscii(event.returnValues[3].replace(/(00)*$/gi, '')),
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

const isConnected = () => !!CONTRACT

export function getEthTransfers(callback: (err: any, transfers: ICrossExchangeTransfer[] | undefined) => void)
{
	if (!web3)
		init()
	
	if (isConnected())
		setTimeout(() => callback(undefined, events.map(eventToCXTransfer)), 1)
	else
		setTimeout(() => getEthTransfers(callback), 20)
}
export function sendEthToken(transfer: ICrossExchangeTransfer): Promise<any>
{
	// mint ETH tokens
	console.log(`\n\n-----TRANSFER ETH-----\n`)
	console.log(transfer)
	console.log(`\n----------------------\n\n`)
	
	if (!validator.validate(transfer.to, "ETH"))
		return Promise.reject(`incorrect ETH address! ${transfer.to}`)
	
	// return Promise.resolve()
	
	let from = SENDER.address
	let m = CONTRACT.methods.mint(transfer.to, Math.floor(transfer.amount))
	console.log(`sending ${m.encodeABI()}`)
	return m.send({
		from,
		gas: 300000,
		gasPrice: web3.utils.toWei('50', "gwei")
	}).then(x => Promise.resolve(x))
}