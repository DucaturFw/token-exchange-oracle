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
var lib_1 = require("./lib");
var neo_vm_1 = require("./neo-vm");
var tools_1 = require("./tools");
exports.NEO_CONTRACT_ADDR = config_1.default.neo.contract.addr;
function getNeoTransfers(callback) {
    lib_1.get_last_transactions_by_address(exports.NEO_CONTRACT_ADDR, function (err, txs) {
        if (err)
            return callback(err, undefined);
        if (!txs)
            return callback("undefined transaction list!", undefined);
        txs = txs.filter(function (x) { return x.type == "InvocationTransaction"; });
        lib_1.getTxsWithLogs(txs.map(function (tx) { return tx.txid; }))
            .then(function (txs) {
            var ethTransfers = [];
            txs.forEach(function (_a) {
                var tx = _a.tx, log = _a.log;
                if (!tx.script)
                    return;
                // console.log(tx)
                var contract = neo_vm_1.parseExchangeCall(tx.script);
                if (!contract || contract.method != "exchange")
                    return;
                if (!log)
                    return console.log("skipping tx #" + tx.txid + " without applog!");
                if (!neo_vm_1.checkTxSuccess(log)) // failed transaction (shouldn't be in the blockchain anyway)
                    return;
                var _b = contract.params, from = _b[0], amount = _b[1], blockchainTo = _b[2], to = _b[3];
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
    // return
    var neoscan = config_1.default.neo.apiUrl + "/api/main_net";
    var ctrHash = config_1.default.neo.contract.hash;
    var makeScript = tools_1.toScriptString(ctrHash);
    // let callContract = ctrInvoker(ctrHash, appConfig.neo.rpc)
    var to = neon_js_1.default.create.account(transfer.to);
    console.log(transfer.to);
    console.log(to.scriptHash);
    /* callContract = (op: string, ...args: any[]) =>
        invoke(
            signRawTx(
                appConfig.neo.contract.owner_pk,
                makeScript(op, args)
            ).serialize(true),
            appConfig.neo.rpc
        ) */
    function sendTx(script) {
        return neon_js_1.default.doInvoke({
            net: neoscan,
            url: config_1.default.neo.rpc,
            script: script,
            account: neon_js_1.default.create.account(config_1.default.neo.contract.owner_pk),
            gas: 0.001,
        }).then(function (tx) { return tx; });
    }
    sendTx(makeScript('mintTokens', neon_js_1.u.reverseHex(to.scriptHash), neon_js_1.u.num2fixed8(transfer.amount), neon_js_1.u.str2hexstring(transfer.blockchainFrom), neon_js_1.u.str2hexstring(transfer.tx))).then(function (x) { return (console.log(x), console.log(x.tx && x.tx.scripts)); }).catch(_err_);
}
exports.sendNeoToken = sendNeoToken;
function _err_(arg) {
    console.log("error:");
    console.error(arg);
    if (arg && arg.result && arg.result.stack)
        console.error(arg.result.stack);
}
