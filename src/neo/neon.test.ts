import Neon, { u as neon_u, wallet } from "@cityofzion/neon-js"
import appConfig from "../config"

it('should parse hex string', () =>
{
	expect(neon_u.hexstring2str("656f73")).toEqual("eos")
})
it('should reverse hex', () =>
{
	expect(neon_u.reverseHex("27c3d71a87b7cc901a5b1ac1611dfaf54cf749f1"))
		.toEqual("f149f74cf5fa1d61c11a5b1a90ccb7871ad7c327")
})
it('should get address from script hash', () =>
{
	let hh = "f149f74cf5fa1d61c11a5b1a90ccb7871ad7c327"
	expect(wallet.getAddressFromScriptHash(hh))
		.toEqual("AKQ8cCUoE99ncnRRbaYPit3pV3g58A6FJk")
})
it('should convert fixed8', () =>
{
	expect(neon_u.fixed82num("404b4c")).toEqual(0.05)
})
it('should create account', () =>
{
	let acc = Neon.create.account("AKQ8cCUoE99ncnRRbaYPit3pV3g58A6FJk")
	expect(acc).toBeDefined()
	expect(acc.scriptHash).toEqual("f149f74cf5fa1d61c11a5b1a90ccb7871ad7c327")
	// expect(acc.publicKey).toEqual('0200da59142c4ce8414091cafe35b063335c8536c9d3c11a56216910179cfec2b2')
})
it('should parse PK to address', () =>
{
	let acc = Neon.create.account(appConfig.neo.contract.owner_pk)
	expect(acc).toBeDefined()
	expect(acc.address).toEqual('AKQ8cCUoE99ncnRRbaYPit3pV3g58A6FJk')
	expect(acc.scriptHash).toEqual('f149f74cf5fa1d61c11a5b1a90ccb7871ad7c327')
	expect(acc.publicKey).toEqual('0200da59142c4ce8414091cafe35b063335c8536c9d3c11a56216910179cfec2b2')
})
let DEFAULT_RPC = {
	MAIN: 'http://seed2.neo.org:10332',
	TEST: 'http://seed2.neo.org:20332'
  }
it('should connect to rpc', done =>
{
	let q = Neon.create.query({ method:"getblockcount" })
	q.execute(appConfig.neo.rpc).then(x => (/* console.log(x),  */done())).catch(done)
})