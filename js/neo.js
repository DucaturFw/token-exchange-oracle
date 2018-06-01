"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var superagent_1 = __importDefault(require("superagent"));
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
