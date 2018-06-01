interface IValueTransfer
{
	value: number
	asset: string
	address_hash: string
}
interface IVout extends IValueTransfer
{
	transaction_id: number
}
interface IVin extends IValueTransfer
{
	txid: string
	n: number
}
interface ITransfer
{
	txid: string
	time: number
	contract: string
	block_height: number
	amount: number
	address_to: string
	address_from: string
}
interface ITransaction
{
	txid: string
	type: string
	time: number
	sys_fee: string
	size: number
	net_fee: string
	id: number
	claims: IVin[]
	block_height: number
	block_hash: string
	asset: any
	vouts: IVout[]
	vin: IVin[]
	transfers: ITransfer[]
}