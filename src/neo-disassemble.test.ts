import { disassemble } from "./neo-disassemble";

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
test('parse exchange contract call', () =>
{

})