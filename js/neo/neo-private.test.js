"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var neon_js_1 = __importStar(require("@cityofzion/neon-js"));
var config_1 = __importDefault(require("../config"));
var tools_1 = require("./tools");
var lib_1 = require("./lib");
describe('misc contract calls', function () {
    it('should convert script hash', function () {
        var SH = 'fe4e4818cd6f32d43315b373f3562d284625dc8a';
        var acc = neon_js_1.default.create.account(SH);
        expect(acc.address).toEqual('AUS6cxNXfxPQ3jAFZQkH8YvruspBkVwX28');
    });
    it('should load contract data', function (done) {
        var SH = 'fe4e4818cd6f32d43315b373f3562d284625dc8a';
        var acc = neon_js_1.default.create.account(SH);
        // console.log(acc.address)
        lib_1.get_last_transactions_by_address(acc.address, function (err, res) {
            if (err)
                return done(err);
            expect(res).toBeDefined();
            expect(res).toBeArray();
            expect(res).not.toBeEmpty();
            if (!res)
                return;
            console.log(res);
            done();
        });
    });
    it('should send tx', function (done) {
        var SH = 'fe4e4818cd6f32d43315b373f3562d284625dc8a';
        var acc = neon_js_1.default.create.account(SH);
        var neoscan = config_1.default.neo.apiUrl + "/api/main_net";
        var makeScript = tools_1.toScriptString(SH);
        var to = neon_js_1.default.create.account('AWLYWXB8C9Lt1nHdDZJnC5cpYJjgRDLk17');
        console.log(to.address);
        console.log(to.scriptHash);
        function sendTx(script) {
            return neon_js_1.default.doInvoke({
                net: neoscan,
                url: config_1.default.neo.rpc,
                script: script,
                account: neon_js_1.default.create.account(config_1.default.neo.contract.owner_pk),
                gas: 0.001,
            }).then(function (tx) { return tx; });
        }
        sendTx(makeScript('mintTokens', neon_js_1.u.reverseHex(to.scriptHash), neon_js_1.u.num2fixed8(1), neon_js_1.u.str2hexstring("eth"), neon_js_1.u.str2hexstring("0x12345678"))).then(function (x) { return (console.log(x), console.log(x.tx && x.tx.scripts), done()); }).catch(done);
    });
});
