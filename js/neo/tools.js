"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var neon_js_1 = __importStar(require("@cityofzion/neon-js"));
var NET_NAME = 'PrivateNet';
function initTestnet(_a) {
    var neoscan = _a.neoscan, neonDB = _a.neonDB;
    var config = {
        name: NET_NAME,
        extra: {
            neoscan: neoscan,
            neonDB: neonDB,
        }
    };
    var privateNet = new neon_js_1.rpc.Network(config);
    neon_js_1.default.add.network(privateNet);
}
exports.initTestnet = initTestnet;
function connect(url) {
    var client = neon_js_1.default.create.rpcClient(url);
    return client;
}
exports.connect = connect;
function accFromEncrypted(key, pass) {
    return neon_js_1.default.create.account(key).decrypt(pass);
}
exports.accFromEncrypted = accFromEncrypted;
function constructMoneyTx(from, to, params) {
    // let acc2addr = "AKQ8cCUoE99ncnRRbaYPit3pV3g58A6FJk"
    // console.log(api.makeIntent({ NEO: 1, GAS: 1 }, acc2addr))
    var txn = neon_js_1.default.create.tx();
    // api.makeIntent({ NEO: 1, GAS: 1 }, acc2addr).forEach(x => txn.addOutput(x.assetId, x.value, acc2addr))
    if (params.neo)
        txn.addOutput('NEO', params.neo, to);
    if (params.gas)
        txn.addOutput('GAS', params.gas, to);
    if (params.remark)
        txn.addRemark(params.remark);
    var acc = (typeof from === "string") ? neon_js_1.default.create.account(from) : from;
    return getBalance(acc.address).then(function (bal) {
        // console.log(JSON.stringify(bal))
        txn.calculate(bal);
        txn.sign(acc);
        console.log(txn);
        console.log(txn.serialize);
        console.log(txn.hash);
        return txn;
    });
}
exports.constructMoneyTx = constructMoneyTx;
function getBalance(address) {
    return neon_js_1.api.neoscan.getBalance(NET_NAME, address);
}
exports.getBalance = getBalance;
function signRawTx(acc, contractTxHex) {
    var txn = new neon_js_1.tx.Transaction(neon_js_1.tx.deserializeTransaction(contractTxHex));
    var acc2 = (typeof acc === "string") ? neon_js_1.default.create.account(acc) : acc;
    txn.sign(acc2);
    // console.log(txn.hash)
    return txn;
    // client.sendRawTransaction(txn).then(x => console.log(x)).catch(err => console.error(err))
}
exports.signRawTx = signRawTx;
function toScriptString(scriptHash) {
    return function (op) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var script = {
            scriptHash: scriptHash,
            operation: op,
            args: args
        };
        // console.log(script)
        return neon_js_1.default.create.script(script);
    };
}
exports.toScriptString = toScriptString;
function invoke(tx, rpcUrl) {
    return neon_js_1.rpc.Query
        .invokeScript(tx)
        .execute(rpcUrl)
        .then(function (res) {
        if (!res || !res.result || res.result.state.includes('FAULT'))
            throw res;
        console.assert(res.result.state.includes('HALT'), "contract not halted!\n" + JSON.stringify(res.result, null, 2) + "\n" + res.result.state);
        return res.result;
    });
}
exports.invoke = invoke;
function ctrInvoker(scriptHash, rpcUrl) {
    var stringy = toScriptString(scriptHash);
    return function (op) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return invoke(stringy.apply(void 0, [op].concat(args)), rpcUrl);
    };
}
exports.ctrInvoker = ctrInvoker;
