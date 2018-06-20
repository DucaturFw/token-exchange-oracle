"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lib_1 = require("./lib");
function parseAmount(amount) {
    var _a = amount.split(' '), value = _a[0], symbol = _a[1];
    value = parseFloat(value);
    return {
        value: value,
        symbol: symbol
    };
}
exports.parseAmount = parseAmount;
function getEosTransfers(callback) {
    lib_1.getTableRows("tester3", "tester3", "exchanges").then(function (res) {
        // console.log(res.rows)
        var transfers = res.rows.map(function (x) { return ({
            amount: parseAmount(x.amount).value,
            to: x.to,
            from: x.from,
            tx: x.id + "",
            blockchainFrom: 'eos',
            blockchainTo: x.blockchain,
        }); });
        callback(undefined, transfers);
    })
        .catch(function (err) { return callback(err, undefined); });
}
exports.getEosTransfers = getEosTransfers;
function sendEosToken(transfer) {
    // mint EOS tokens
    console.log("\n\n-----TRANSFER EOS-----\n");
    console.log(transfer);
    console.log("\n----------------------\n\n");
}
exports.sendEosToken = sendEosToken;
