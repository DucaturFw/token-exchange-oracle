export default require('../data/config.json') as {
	eos: {
		pk: string
		rpc: string
		chainId: string
	},
	eth: {
		ws: string
	}
}