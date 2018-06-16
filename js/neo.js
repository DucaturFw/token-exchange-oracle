"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var superagent_1 = __importDefault(require("superagent"));
var neo_disassemble_1 = require("./neo-disassemble");
var neon_js_1 = require("@cityofzion/neon-js");
exports.NEO_API_URL = "http://18.206.212.253:4000";
exports.NEO_CONTRACT_ADDR = "";
function fakeContractData() {
    // FAKE CONTRACT DATA
    var from = "AKQ8cCUoE99ncnRRbaYPit3pV3g58A6FJk";
    var receiver = "0x54b7BC5BEa3845198Ff2936761087fc488504eeD";
    var tokenAmount = 233;
    var blockchainName = "ETH";
    return {
        method: "exchange",
        params: [from, tokenAmount, blockchainName, receiver]
    };
}
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
    // let int = (x: string) => neon_u.Fixed8.fromHex(x)
    var int = function (x) { return parseInt(x, 16); };
    var exchArgs = juxt(hex, int, hex, hex);
    return {
        method: call.method,
        params: exchArgs.apply(null, call.params)
    };
}
exports.parseExchangeCall = parseExchangeCall;
function parseContractCall(script) {
    var asm = neo_disassemble_1.disassemble(script);
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
    function parseContract(contract) {
        return fakeContractData();
    }
    superagent_1.default(exports.NEO_API_URL + "/api/main_net/v1/get_last_transactions_by_address/" + exports.NEO_CONTRACT_ADDR)
        .end(function (err, res) {
        if (err)
            return callback(err, undefined);
        var txs = res.body;
        if (!txs || !Array.isArray(txs))
            return callback("not an array! " + txs, undefined);
        txs = txs.filter(function (x) { return x.transfers && x.transfers.length; });
        var ethTransfers = [];
        txs.forEach(function (tx) {
            tx.transfers.forEach(function (transfer) {
                if (!transfer.contract)
                    return;
                var contract = parseContract(transfer.contract);
                if (contract.method != "exchange")
                    return;
                var _a = contract.params, from = _a[0], amount = _a[1], blockchainTo = _a[2], to = _a[3];
                ethTransfers.push({
                    from: from,
                    to: to,
                    amount: amount,
                    tx: tx.txid,
                    blockchainFrom: "NEO",
                    blockchainTo: blockchainTo,
                });
            });
        });
        return callback(undefined, ethTransfers);
    });
}
exports.getNeoTransfers = getNeoTransfers;
function sendNeoToken(transfer) {
    // mint NEO tokens
}
exports.sendNeoToken = sendNeoToken;
