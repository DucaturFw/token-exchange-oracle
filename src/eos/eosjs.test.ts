import "jest-extended"

import {eos} from "./lib"
import appConfig from "../config"

describe('Jungle', () =>
{
	let PUB_KEY = 'EOS6GRjeBum8jMgwjS91AMn6QmP6SrazRndhTAY797GbMaEqW7D5W'
	it('should get account from public key', done =>
	{
		eos.getKeyAccounts(PUB_KEY)
			.then(x =>
			{
				expect(x.account_names).toIncludeAllMembers(['ducatur', 'ducaturtoken', 'duccntr'])
				done()
			})
			.catch(err => done(err))
	})
})