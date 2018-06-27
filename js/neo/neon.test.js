"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var neon_js_1 = __importDefault(require("@cityofzion/neon-js"));
var config_1 = __importDefault(require("../config"));
it('should parse hex string', function () {
    expect(neon_js_1.u.hexstring2str("656f73")).toEqual("eos");
});
it('should reverse hex', function () {
    expect(neon_js_1.u.reverseHex("27c3d71a87b7cc901a5b1ac1611dfaf54cf749f1"))
        .toEqual("f149f74cf5fa1d61c11a5b1a90ccb7871ad7c327");
});
it('should get address from script hash', function () {
    var hh = "f149f74cf5fa1d61c11a5b1a90ccb7871ad7c327";
    expect(neon_js_1.wallet.getAddressFromScriptHash(hh))
        .toEqual("AKQ8cCUoE99ncnRRbaYPit3pV3g58A6FJk");
});
it('should convert fixed8', function () {
    expect(neon_js_1.u.fixed82num("404b4c")).toEqual(0.05);
});
it('should create account', function () {
    var acc = neon_js_1.default.create.account("AKQ8cCUoE99ncnRRbaYPit3pV3g58A6FJk");
    expect(acc).toBeDefined();
    expect(acc.scriptHash).toEqual("f149f74cf5fa1d61c11a5b1a90ccb7871ad7c327");
    // expect(acc.publicKey).toEqual('0200da59142c4ce8414091cafe35b063335c8536c9d3c11a56216910179cfec2b2')
});
it('should parse PK to address', function () {
    var acc = neon_js_1.default.create.account(config_1.default.neo.contract.owner_pk);
    expect(acc).toBeDefined();
    expect(acc.address).toEqual('AKQ8cCUoE99ncnRRbaYPit3pV3g58A6FJk');
    expect(acc.scriptHash).toEqual('f149f74cf5fa1d61c11a5b1a90ccb7871ad7c327');
    expect(acc.publicKey).toEqual('0200da59142c4ce8414091cafe35b063335c8536c9d3c11a56216910179cfec2b2');
});
var DEFAULT_RPC = {
    MAIN: 'http://seed2.neo.org:10332',
    TEST: 'http://seed2.neo.org:20332'
};
it('should connect to rpc', function (done) {
    var q = neon_js_1.default.create.query({ method: "getblockcount" });
    q.execute(config_1.default.neo.rpc).then(function (x) { return ( /* console.log(x),  */done()); }).catch(done);
});
