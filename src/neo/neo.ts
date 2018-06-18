import agent from "superagent"
import { disassemble, IEntry } from "./neo-disassemble"
import { u as neon_u } from "@cityofzion/neon-js"

export let NEO_API_URL = `http://18.206.212.253:4000`
export let NEO_CONTRACT_ADDR = ``

function fakeContractData()
{
	// FAKE CONTRACT DATA
	let from = "AKQ8cCUoE99ncnRRbaYPit3pV3g58A6FJk"
	let receiver = "0x54b7BC5BEa3845198Ff2936761087fc488504eeD"
	let tokenAmount = 233
	let blockchainName = "ETH"
	return {
		method: "exchange",
		params: [from, tokenAmount, blockchainName, receiver]
	}
}
export function parseExchangeCall(script: string)
{
	let call = parseContractCall(script)
	if (!call)
		return undefined
	if (call.method != "exchange")
		return undefined
	if (call.params.length != 4)
		return undefined
	
	// console.log(call)
	
	let juxt = (...funcs: ((a:string) => any)[]) => (...args: any[]) => args.map((x, idx) => funcs[idx](x))
	let hex = (x: string) => neon_u.hexstring2str(x)
	// let int = (x: string) => neon_u.Fixed8.fromHex(x)
	let int = (x: string) => parseInt(x, 16)
	let exchArgs = juxt(hex, int, hex, hex)
	return {
		method: call.method,
		params: exchArgs.apply(null, call.params)
	}
}
export function parseContractCall(script: string)
{
	let asm = disassemble(script)
	let e = asm.pop()
	if (!e)
		return undefined
	if (e.name != "APPCALL")
		return undefined
	
	let methodEntry = asm.pop()
	if (!methodEntry || !methodEntry.name.startsWith("PUSHBYTES") || !methodEntry.hex)
		return undefined
	
	let result = {
		method: neon_u.hexstring2str(methodEntry.hex),
		params: [] as string[]
	}

	// e = asm.pop()

	e = asm[asm.length - 1]


	if (e && e.name.startsWith("PACK"))
	{
		asm.pop() // PACK
		e = asm.pop() // length
		// console.log(e)
		// console.log(asm)
		if (!e || !e.name.startsWith("PUSH") || (e.int != asm.length))
			return undefined
	}
	
	// let argsLenEntry = asm.pop()
	// if (!argsLenEntry || !argsLenEntry.int)
	// 	return result
	
	while (asm.length)
	{
		e = asm.pop()
		if (!e)
			break
		
		// if (!e.name.startsWith("PUSHBYTES"))
		// 	break
		
		if (!e.hex)
			break
		
		result.params.push(e.hex)
	}

	return result
}

export function getNeoTransfers(callback: (err: any, transfers: ICrossExchangeTransfer[] | undefined) => void)
{
	function parseContract(contract: string)
	{
		return fakeContractData()
	}

	agent(`${NEO_API_URL}/api/main_net/v1/get_last_transactions_by_address/${NEO_CONTRACT_ADDR}`)
		.end((err, res) =>
		{
			if (err)
				return callback(err, undefined)
			
			let txs = res.body as ITransaction[]
			if (!txs || !Array.isArray(txs))
				return callback(`not an array! ${txs}`, undefined)

			txs = txs.filter(x => x.transfers && x.transfers.length)

			let ethTransfers: ICrossExchangeTransfer[] = []
			txs.forEach(tx =>
			{
				tx.transfers.forEach(transfer =>
				{
					if (!transfer.contract)
						return
					
					let contract = parseContract(transfer.contract)
					if (contract.method != "exchange")
						return
					
					let [from, amount, blockchainTo, to] = contract.params as [string, number, string, string]
					ethTransfers.push({
						from,
						to,
						amount,
						tx: tx.txid,
						blockchainFrom: "NEO",
						blockchainTo,
					})
				})
			})
			return callback(undefined, ethTransfers)
		})
}
export function sendNeoToken(transfer: ICrossExchangeTransfer)
{
	// mint NEO tokens
}