interface IValueTransfer
{
	value: number
	asset: string
}
interface IVout extends IValueTransfer
{
	transaction_id: number
	address: string
}
interface IVin extends IValueTransfer
{
	txid: string
	n: number
	address_hash: string
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
interface IStackItem
{
	type: string | "ByteArray" | "Integer"
	value: string
}
interface IApplogTx
{
	txid: string
	vmstate: string
	gas_consumed: string
	stack: IStackItem[]
	notifications: { contract: string, state: { type: string, value: IStackItem[] } }[]
}