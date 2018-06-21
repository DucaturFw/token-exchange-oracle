"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var neo_disassemble_1 = require("./neo-disassemble");
var neon_js_1 = require("@cityofzion/neon-js");
var config_1 = __importDefault(require("../config"));
var lib_1 = require("./lib");
exports.NEO_CONTRACT_ADDR = config_1.default.neo.contractAddr;
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
    console.log(asm);
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
function getNeoTransfers(callback) {
    lib_1.get_last_transactions_by_address(exports.NEO_CONTRACT_ADDR, function (err, txs) {
        if (err)
            return callback(err, undefined);
        if (!txs)
            return callback("undefined transaction list!", undefined);
        txs = txs.filter(function (x) { return x.type == "InvocationTransaction"; });
        lib_1.get_transactions(txs.map(function (tx) { return tx.txid; }))
            .then(function (txs) {
            var ethTransfers = [];
            txs.forEach(function (tx) {
                if (!tx.script)
                    return;
                // console.log(tx)
                var contract = parseExchangeCall(tx.script);
                if (!contract || contract.method != "exchange")
                    return;
                var _a = contract.params, from = _a[0], amount = _a[1], blockchainTo = _a[2], to = _a[3];
                blockchainTo = blockchainTo.toLowerCase();
                ethTransfers.push({
                    from: from,
                    to: to,
                    amount: amount,
                    tx: tx.txid,
                    blockchainFrom: "neo",
                    blockchainTo: blockchainTo,
                });
            });
            return callback(undefined, ethTransfers);
        })
            .catch(function (err) { return callback(err, undefined); });
    });
}
exports.getNeoTransfers = getNeoTransfers;
function sendNeoToken(transfer) {
    // mint NEO tokens
    console.log("\n\n-----TRANSFER NEO-----\n");
    console.log(transfer);
    console.log("\n----------------------\n\n");
}
exports.sendNeoToken = sendNeoToken;
