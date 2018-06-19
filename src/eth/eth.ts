import Web3 from "web3"
import { EventLog } from "web3/types"
import appConfig from "../config"

let ETH_ABI = require('../../data/ducatur-eth.abi.json')
let ETH_CONTRACT_ADDR = `0x16237cda239d9e368ab67dc4e5a28964759727ec`
ETH_CONTRACT_ADDR = `0x60903CDA8643805F9567a083C1734E139Fe7dAD2`

let web3 = new Web3(new Web3.providers.WebsocketProvider(appConfig.eth.ws))

let events = [] as EventLog[]

web3.eth.net.isListening().then(b =>
{
	// console.log(`connected: ${b}`)

	let ctr = new web3.eth.Contract(ETH_ABI, ETH_CONTRACT_ADDR)
	ctr.events.BlockchainExchange({ fromBlock: 0 }, (err, ev) => err ? console.error(err) : events.push(ev))
}).catch(err => console.error(err))

function eventToCXTransfer(event: EventLog): ICrossExchangeTransfer
{
	return {
		blockchainFrom: "eth",
		from: event.returnValues[0],
		amount: event.returnValues[1],
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
	return callback(undefined, events.map(eventToCXTransfer))
}
export function sendEthToken(transfer: ICrossExchangeTransfer)
{
	// mint ETH tokens
	console.log(`\n\n-----TRANSFER ETH-----\n`)
	console.log(transfer)
	console.log(`\n----------------------\n\n`)
}