import "jest-extended"

import { getEthTransfers, eventToCXTransfer } from "./eth"
import Web3 from "web3"
import appConfig from "../config"

it('should get eth transfers', done =>
{
	getEthTransfers((err, transfers) =>
	{
		expect(err).toBeFalsy()
		expect(transfers).toBeDefined()
		expect(transfers).toBeArray()

		// console.log(transfers)

		done()
	})
})
it('should transform private key to public', () =>
{
	let web3 = new Web3()
	let addr = web3.eth.accounts.privateKeyToAccount(appConfig.eth.owner_pk).address
	expect(addr).toEqual("0xAd23AeB201fD9576809B3dEcA0Ac0ec21A2fE9a2")
})
it('should convert eth events from db to data', () =>
{
	let data = {
		"address":  "0x60903CDA8643805F9567a083C1734E139Fe7dAD2" ,
		"blockHash":  "0x078cbfe9d40bfca7d6289a7edd671023146cbd6c89b4ac69b6f0d569d9a9b4dc" ,
		"blockNumber": 2583261 ,
		"event":  "BlockchainExchange" ,
		"id":  "log_53dadfcc" ,
		"logIndex": 12 ,
		"raw": {
		"data": "0x0000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000026475636f6e650000000000000000000000000000000000000000000000000000" ,
		"topics": [
		"0x1bd4f3ccb033d46a13c7885d6d5b897221058f5192194fa797bd74e531dac56f" ,
		"0x000000000000000000000000560e36b2d58f7e71499f58f5c9269b5a3989be4c"
		]
		} ,
		"removed": false ,
		"returnValues": {
		"0":  "0x560e36b2d58f7e71499f58f5c9269B5A3989Be4C" ,
		"1":  "1000000000000000000" ,
		"2":  "2" ,
		"3":  "0x6475636f6e650000000000000000000000000000000000000000000000000000" ,
		"adr":  "0x6475636f6e650000000000000000000000000000000000000000000000000000" ,
		"from":  "0x560e36b2d58f7e71499f58f5c9269B5A3989Be4C" ,
		"newNetwork":  "2" ,
		"value":  "1000000000000000000"
		} ,
		"signature":  "0x1bd4f3ccb033d46a13c7885d6d5b897221058f5192194fa797bd74e531dac56f" ,
		"transactionHash":  "0xf0ea6095f829046a80497a0a4ed0b839224535d4303220e926ae13ff437e0ed1" ,
		"transactionIndex": 2
	}
	let tx = eventToCXTransfer(data)
	expect(tx.amount).toEqual(1)
	expect(tx.blockchainFrom).toEqual('eth')
	expect(tx.blockchainTo).toEqual('eos')
	expect(tx.from).toEqual('0x560e36b2d58f7e71499f58f5c9269B5A3989Be4C')
	expect(tx.to).toEqual('ducone')
	expect(tx.tx).toEqual('0xf0ea6095f829046a80497a0a4ed0b839224535d4303220e926ae13ff437e0ed1')
})