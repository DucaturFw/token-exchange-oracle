import "jest-extended"

import { getEthTransfers } from "./eth"
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