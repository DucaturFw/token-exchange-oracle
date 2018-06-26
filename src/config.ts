export default require('../data/config.json') as {
	eos: {
		pk: string
		rpc: string
		chainId: string
		contractAddr: string
	},
	eth: {
		ws: string
		contractAddr: string
	},
	neo: {
		apiUrl: string
		applog: string
		contractAddr: string
	}
}