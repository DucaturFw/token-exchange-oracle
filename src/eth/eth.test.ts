import "jest-extended"

import { getEthTransfers } from "./eth"

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