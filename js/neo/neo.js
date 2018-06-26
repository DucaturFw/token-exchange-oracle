"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = __importDefault(require("../config"));
var lib_1 = require("./lib");
var neo_vm_1 = require("./neo-vm");
exports.NEO_CONTRACT_ADDR = config_1.default.neo.contractAddr;
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
}
exports.sendNeoToken = sendNeoToken;
