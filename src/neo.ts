import agent from "superagent"

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