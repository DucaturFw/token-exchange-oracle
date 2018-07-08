import r from 'rethinkdb'
import appConfig from './config'

let processed: { [tx: string]: boolean } = {
	'b1b0b7dc1a0b36bf8a2073f2406463aa65516deb131261462b8b7a36deb1f8f6': true,
	'b2daa1fefd2ae1d0d3896525c9b9b0d07ac24b2547c43d6fb8ec9e35d3f1428a': true,
	'3a95624ad301c3dcecd1401f87fae7d8b7d1ed887da7ae2f67f549fb668252f1': true,
	"7794a22afda0750fc25ca05ed4d0442346d89595670a75ca7dfdb9dd365b7126": true,
	"0": true,
	"1": true,
	"2": true,
	"3": true,
	"4": true,
	"5": true,
	"6": true,
	"7": true,
	"8": true,
	// "1": true,
	"0x74ab1dec2b138e8292edd33b3f82747968f9f8c70fa34889e181dbba932af4ed": true,
	"0x9cdc1bab13ff6abbf47155e6a745024c52c4a18d834952728ee7ab54bd1d52ed": true,
}
let connection: r.Connection
let table: r.Table

export function getProcessed(): Promise<{ [tx: string]: boolean }>
{
	return r.connect(appConfig.rethink).then(conn =>
	{
		connection = conn
		table = r.db('oracle').table('sentTxs')
		return table.changes({includeInitial: true}).run(conn).then(cursor =>
		{
			return new Promise<{ [tx: string]: boolean }>((res, rej) =>
			{
				cursor.each<{ new_val: { txid: string } }>((err, row) =>
				{
					if (err)
						return console.error(err)
					
					processed[row.new_val.txid] = true
				}, () => res(processed))
			})
		})
	})
}
export function isProcessed(txid: string): boolean
{
	return processed[txid]
}
export function markProcessed(txid: string): Promise<any>
{
	return table.insert({ txid }).run(connection)
}