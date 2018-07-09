export default require('../data/config.json') as {
	eos: {
		pk: string
		rpc: string
		chainId: string
		contract: {
			addr: string
			owner: string
			owner_pk: string
		}
		defaults: {
			eosio_token: string
			symbol: string
		}
	}
	eth: {
		ws: string
		https: string
		contractAddr: string
		owner_pk: string
	}
	neo: {
		apiUrl: string
		applog: string
		rpc: string
		contract: {
			owner_pk: string
			hash: string
			addr: string
		}
	}
	rethink: {
		host: string
		port: number
	}
}