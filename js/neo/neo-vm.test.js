"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("jest-extended");
var neo_vm_1 = require("./neo-vm");
var FAIL_TX = "0801e65c00000000000840420f000000000014f9e6e770af783d809bd1a65e1bb5b6042953bcac080303000000000000209b7cffdaa674beae0f930ebe6085af9093e5fe56b34a5c220ccdcf6efc336fc514dc98759406cc2130dcd0d93c4c6e8a82b55b454456c1096d616b654f6666657267bd097b2fcf70e1fd30a5c3ef51e662feeafeba01";
var NORM_TX = "03307830034554485a224151764273374e4472783937716a5031547a64547864436e636847616b38626a64740865786368616e67656759b6f25c66b8229875bee6131363114f2c32668d";
// NORM_TX = "40e9427a814f5b9a3f56f68e1e29be58a79cd84aa7c1ac948556510a63fef1ea11401834efce3f2ba8b4571eb91baf909e06b64a1812420e8ef2bd3cf160a31d39"
test('parse contract call', function () {
    var tx = FAIL_TX;
    var m = neo_vm_1.parseContractCall(tx);
    expect(m).toBeDefined();
    if (!m)
        return;
    expect(m.method).toEqual("makeOffer");
    expect(m.params).toHaveLength(6);
    expect(m.params[2]).toEqual("0303000000000000");
});
test('parse incorrect exchange contract call', function () {
    var tx = FAIL_TX;
    var m = neo_vm_1.parseExchangeCall(tx);
    expect(m).toBeUndefined();
});
test('parse exchange contract call old & incomplete', function () {
    var txScript = NORM_TX;
    var c = neo_vm_1.parseContractCall(txScript);
    expect(c).toBeDefined();
    if (!c)
        return;
    expect(c.method).toEqual("exchange");
    expect(c.params).toHaveLength(4);
    var m = neo_vm_1.parseExchangeCall(txScript);
    expect(m).toBeDefined();
    if (!m)
        return;
    expect(m.method).toEqual("exchange");
    expect(m.params).toHaveLength(4);
});
test('parse exchange contract call #2 — fail on python type error', function () {
    var txScript = '06d1da4b86e64303656f7303404b4c1427c3d71a87b7cc901a5b1ac1611dfaf54cf749f154c10865786368616e6765678adc2546282d56f373b31533d4326fcd18484efe';
    var ec = neo_vm_1.parseExchangeCall(txScript);
    expect(ec).toBeDefined();
    if (!ec)
        return;
    expect(ec.method).toEqual("exchange");
    expect(ec.params).toHaveLength(4);
    expect(ec.params[0]).toEqual("AKQ8cCUoE99ncnRRbaYPit3pV3g58A6FJk");
    expect(ec.params[1]).toEqual(0.05);
    expect(ec.params[2]).toEqual("eos");
    expect(ec.params[3]).not.toEqual("tester3");
});
