let ETH_API_URL = ``
let ETH_ABI = require('../data/ducatur-eth.abi')
let ETH_CONTRACT_ADDR = `0x16237cda239d9e368ab67dc4e5a28964759727ec`

export function getEthTransfers(callback: (err: any, transfers: ICrossExchangeTransfer[] | undefined) => void)
{
	// get ETH transfers from public API
	return callback("not implemented!", undefined)
}
export function sendEthToken(transfer: ICrossExchangeTransfer)
{
	// mint ETH tokens
}