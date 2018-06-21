import { u as neon_u, wallet } from "@cityofzion/neon-js"

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