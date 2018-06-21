import { disassemble } from "./neo-disassemble"

const SHIT_TX = "0801e65c00000000000840420f000000000014f9e6e770af783d809bd1a65e1bb5b6042953bcac080303000000000000209b7cffdaa674beae0f930ebe6085af9093e5fe56b34a5c220ccdcf6efc336fc514dc98759406cc2130dcd0d93c4c6e8a82b55b454456c1096d616b654f6666657267bd097b2fcf70e1fd30a5c3ef51e662feeafeba01"

test('parse "make offer" transaction script', () =>
{
	let tx = SHIT_TX
	let entries = disassemble(tx)
	expect(entries).toBeDefined()
	expect(entries.length).toEqual(10)
	entries.forEach(e => expect(e).toBeDefined())

	expect(entries[0].name).toEqual("PUSHBYTES8")
	expect(entries[1].name).toEqual("PUSHBYTES8")
	expect(entries[2].name).toEqual("PUSHBYTES20")
	expect(entries[3].name).toEqual("PUSHBYTES8")
	expect(entries[4].name).toEqual("PUSHBYTES32")
	expect(entries[5].name).toEqual("PUSHBYTES20")
	expect(entries[6].name).toEqual("PUSH6")
	expect(entries[7].name).toEqual("PACK")
	expect(entries[8].name).toEqual("PUSHBYTES9")
	expect(entries[9].name).toEqual("APPCALL")
})

import { parseContractCall, parseExchangeCall } from "./neo"

test('parse contract call', () =>
{
	let tx = SHIT_TX
	let m = parseContractCall(tx)
	expect(m).toBeDefined()
	if (!m)
		return
	
	expect(m.method).toEqual("makeOffer")
	expect(m.params).toHaveLength(6)
	expect(m.params[2]).toEqual("0303000000000000")
})
test('parse incorrect exchange contract call', () =>
{
	let tx = SHIT_TX
	let m = parseExchangeCall(tx)
	expect(m).toBeUndefined()
})
let NORM_TX = "03307830034554485a224151764273374e4472783937716a5031547a64547864436e636847616b38626a64740865786368616e67656759b6f25c66b8229875bee6131363114f2c32668d"
// NORM_TX = "40e9427a814f5b9a3f56f68e1e29be58a79cd84aa7c1ac948556510a63fef1ea11401834efce3f2ba8b4571eb91baf909e06b64a1812420e8ef2bd3cf160a31d39"
test('parse exchange disassemble', () =>
{
	let tx = NORM_TX
	let c = disassemble(tx)
	expect(c).toBeDefined()
	expect(c).toHaveLength(6)
	
	expect(c[5].name).toEqual("APPCALL")
	
	expect(c[4].name).toEqual(`PUSHBYTES8`)
	expect(c[4].hex).toEqual(`65786368616e6765`)
})
test('parse exchange contract call old & incomplete', () =>
{
	let txScript = NORM_TX
	let c = parseContractCall(txScript)
	expect(c).toBeDefined()

	if (!c)
		return
	
	expect(c.method).toEqual("exchange")
	expect(c.params).toHaveLength(4)

	let m = parseExchangeCall(txScript)
	expect(m).toBeDefined()
	if (!m)
		return
	
	expect(m.method).toEqual("exchange")
	expect(m.params).toHaveLength(4)
})
test('parse exchange contract call #2 — fail on python type error', () =>
{
	let txScript = '06d1da4b86e64303656f7303404b4c1427c3d71a87b7cc901a5b1ac1611dfaf54cf749f154c10865786368616e6765678adc2546282d56f373b31533d4326fcd18484efe'
	let ec = parseExchangeCall(txScript)
	expect(ec).toBeDefined()
	if (!ec)
		return
	
	expect(ec.method).toEqual("exchange")
	expect(ec.params).toHaveLength(4)
	expect(ec.params[0]).toEqual("AKQ8cCUoE99ncnRRbaYPit3pV3g58A6FJk")
	expect(ec.params[1]).toEqual(0.05)
	expect(ec.params[2]).toEqual("eos")
	expect(ec.params[3]).not.toEqual("tester3")
})