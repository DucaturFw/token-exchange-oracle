"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var web3_1 = __importDefault(require("web3"));
var config_1 = __importDefault(require("../config"));
var rethinkdb_1 = __importDefault(require("rethinkdb"));
var ETH_ABI = require('../../data/ducatur-eth.abi.json');
var web3 = new web3_1.default(new web3_1.default.providers.HttpProvider(config_1.default.eth.https));
var events = [];
var connected = false;
var dbpromise = rethinkdb_1.default.connect(config_1.default.rethink).then(function (connection) {
    return rethinkdb_1.default.db('ethereum').table('contractCalls')
        .orderBy({
        index: rethinkdb_1.default.desc('chronological')
    })
        .filter({
        event: "BlockchainExchange",
        address: config_1.default.eth.contractAddr
    }).changes({ includeInitial: true }).run(connection);
});
Promise.all([dbpromise, web3.eth.net.isListening()]).then(function (_a) {
    var cursor = _a[0], ethConnected = _a[1];
    console.log("connected ETH!");
    connected = true;
    web3.eth.accounts.wallet.add(config_1.default.eth.owner_pk);
    cursor.each(function (err, row) {
        if (err)
            return console.error(err);
        events.push(row.new_val);
    });
});
function eventToCXTransfer(event) {
    return {
        blockchainFrom: "eth",
        from: event.returnValues[0],
        amount: parseFloat(event.returnValues[1]),
        blockchainTo: bcIdxToName(event.returnValues[2]),
        to: event.returnValues[3],
        tx: event.transactionHash
    };
}
function bcIdxToName(idx) {
    idx = idx + "";
    var map = {
        0: "eth",
        1: "neo",
        2: "eos",
        3: "qtum",
        4: "bts"
    };
    return map[idx];
}
function getEthTransfers(callback) {
    if (connected)
    return callback(undefined, events.map(eventToCXTransfer));
    else
        setTimeout(function () { return getEthTransfers(callback); }, 100);
}
exports.getEthTransfers = getEthTransfers;
function sendEthToken(transfer) {
    // mint ETH tokens
    console.log("\n\n-----TRANSFER ETH-----\n");
    console.log(transfer);
    console.log("\n----------------------\n\n");
}
exports.sendEthToken = sendEthToken;
