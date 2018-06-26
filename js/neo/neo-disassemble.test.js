"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var neo_disassemble_1 = require("./neo-disassemble");
var FAIL_TX = "0801e65c00000000000840420f000000000014f9e6e770af783d809bd1a65e1bb5b6042953bcac080303000000000000209b7cffdaa674beae0f930ebe6085af9093e5fe56b34a5c220ccdcf6efc336fc514dc98759406cc2130dcd0d93c4c6e8a82b55b454456c1096d616b654f6666657267bd097b2fcf70e1fd30a5c3ef51e662feeafeba01";
var NORM_TX = "03307830034554485a224151764273374e4472783937716a5031547a64547864436e636847616b38626a64740865786368616e67656759b6f25c66b8229875bee6131363114f2c32668d";
// NORM_TX = "40e9427a814f5b9a3f56f68e1e29be58a79cd84aa7c1ac948556510a63fef1ea11401834efce3f2ba8b4571eb91baf909e06b64a1812420e8ef2bd3cf160a31d39"
test('parse "make offer" transaction script', function () {
    var tx = FAIL_TX;
    var entries = neo_disassemble_1.disassemble(tx);
    expect(entries).toBeDefined();
    expect(entries.length).toEqual(10);
    entries.forEach(function (e) { return expect(e).toBeDefined(); });
    expect(entries[0].name).toEqual("PUSHBYTES8");
    expect(entries[1].name).toEqual("PUSHBYTES8");
    expect(entries[2].name).toEqual("PUSHBYTES20");
    expect(entries[3].name).toEqual("PUSHBYTES8");
    expect(entries[4].name).toEqual("PUSHBYTES32");
    expect(entries[5].name).toEqual("PUSHBYTES20");
    expect(entries[6].name).toEqual("PUSH6");
    expect(entries[7].name).toEqual("PACK");
    expect(entries[8].name).toEqual("PUSHBYTES9");
    expect(entries[9].name).toEqual("APPCALL");
});
test('parse exchange disassemble', function () {
    var tx = NORM_TX;
    var c = neo_disassemble_1.disassemble(tx);
    expect(c).toBeDefined();
    expect(c).toHaveLength(6);
    expect(c[5].name).toEqual("APPCALL");
    expect(c[4].name).toEqual("PUSHBYTES8");
    expect(c[4].hex).toEqual("65786368616e6765");
});
