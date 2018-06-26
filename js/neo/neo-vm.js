"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var neo_disassemble_1 = require("./neo-disassemble");
var neon_js_1 = require("@cityofzion/neon-js");
exports.HALT_BREAK = "HALT, BREAK";
exports.VM_TYPES = {
    Integer: "Integer"
};
function checkTxSuccess(applog) {
    // tx is successful when execution ends correctly
    // and TRUE (Integer "1") is returned on stack
    // (depends on contract implementation, works for us)
    if (applog.vmstate != exports.HALT_BREAK) // execution failed
        return false;
    if (!applog.stack || !applog.stack.length) // no items on stack
        return false;
    var ret = applog.stack.pop();
    if (!ret) // can't happen, only needed for TS compiler
        return false;
    if (ret.type != exports.VM_TYPES.Integer) // return value type is incorrect
        return false;
    if (ret.value != "1") // return value is not TRUE
        return false;
    return true;
}
exports.checkTxSuccess = checkTxSuccess;
function parseExchangeCall(script) {
    var call = parseContractCall(script);
    if (!call)
        return undefined;
    if (call.method != "exchange")
        return undefined;
    if (call.params.length != 4)
        return undefined;
    // console.log(call)
    var juxt = function () {
        var funcs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            funcs[_i] = arguments[_i];
        }
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return args.map(function (x, idx) { return funcs[idx](x); });
        };
    };
    var hex = function (x) { return neon_js_1.u.hexstring2str(x); };
    var addr = function (x) { return neon_js_1.wallet.getAddressFromScriptHash(neon_js_1.u.reverseHex(x)); };
    // let int = (x: string) => neon_u.Fixed8.fromHex(x)
    var int = function (x) { return neon_js_1.u.fixed82num(x); };
    var exchArgs = juxt(addr, int, hex, hex);
    return {
        method: call.method,
        params: exchArgs.apply(null, call.params)
    };
}
exports.parseExchangeCall = parseExchangeCall;
function parseContractCall(script) {
    var asm = neo_disassemble_1.disassemble(script);
    // console.log(asm)
    var e = asm.pop();
    if (!e)
        return undefined;
    if (e.name != "APPCALL")
        return undefined;
    var methodEntry = asm.pop();
    if (!methodEntry || !methodEntry.name.startsWith("PUSHBYTES") || !methodEntry.hex)
        return undefined;
    var result = {
        method: neon_js_1.u.hexstring2str(methodEntry.hex),
        params: []
    };
    // e = asm.pop()
    e = asm[asm.length - 1];
    if (e && e.name.startsWith("PACK")) {
        asm.pop(); // PACK
        e = asm.pop(); // length
        // console.log(e)
        // console.log(asm)
        if (!e || !e.name.startsWith("PUSH") || (e.int != asm.length))
            return undefined;
    }
    // let argsLenEntry = asm.pop()
    // if (!argsLenEntry || !argsLenEntry.int)
    // 	return result
    while (asm.length) {
        e = asm.pop();
        if (!e)
            break;
        // if (!e.name.startsWith("PUSHBYTES"))
        // 	break
        if (!e.hex)
            break;
        result.params.push(e.hex);
    }
    return result;
}
exports.parseContractCall = parseContractCall;
