"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var web3_1 = __importDefault(require("web3"));
var config_1 = __importDefault(require("../config"));
var rethinkdb_1 = __importDefault(require("rethinkdb"));
var wallet_address_validator_1 = __importDefault(require("wallet-address-validator"));
var ETH_ABI = require('../../data/ducatur-eth.abi.json');
var web3;
var CONTRACT;
var SENDER;
var events = [];
function init() {
    if (web3)
        return;
    web3 = new web3_1.default(new web3_1.default.providers.HttpProvider(config_1.default.eth.https));
    rethinkdb_1.default.connect(config_1.default.rethink).then(function (connection) {
        console.log("connected ETH!");
        CONTRACT = new web3.eth.Contract(ETH_ABI, config_1.default.eth.contractAddr);
        SENDER = web3.eth.accounts.privateKeyToAccount(config_1.default.eth.owner_pk);
        web3.eth.accounts.wallet.add(SENDER);
        rethinkdb_1.default.db('ethereum').table('contractCalls')
            .orderBy({
            index: rethinkdb_1.default.desc('chronological')
        })
            .filter({
            event: "BlockchainExchange",
            address: config_1.default.eth.contractAddr
        })
            .changes({ includeInitial: true })
            .run(connection)
            .then(function (cursor) {
            cursor.each(function (err, row) {
                if (err)
                    return console.error(err);
                events.push(row.new_val);
            });
        });
    });
}
exports.init = init;
function eventToCXTransfer(event) {
    return {
        blockchainFrom: "eth",
        from: event.returnValues[0],
        amount: parseFloat(event.returnValues[1]) / 1e18,
        blockchainTo: bcIdxToName(event.returnValues[2]),
        to: web3.utils.hexToAscii(event.returnValues[3].replace(/(00)*$/gi, '')),
        tx: event.transactionHash
    };
}
exports.eventToCXTransfer = eventToCXTransfer;
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
var isConnected = function () { return !!CONTRACT; };
function getEthTransfers(callback) {
    if (!web3)
        init();
    if (isConnected())
        setTimeout(function () { return callback(undefined, events.map(eventToCXTransfer)); }, 1);
    else
        setTimeout(function () { return getEthTransfers(callback); }, 20);
}
exports.getEthTransfers = getEthTransfers;
function sendEthToken(transfer) {
    // mint ETH tokens
    console.log("\n\n-----TRANSFER ETH-----\n");
    console.log(transfer);
    console.log("\n----------------------\n\n");
    if (!wallet_address_validator_1.default.validate(transfer.to, "ETH"))
        return Promise.reject("incorrect ETH address! " + transfer.to);
    // return Promise.resolve()
    var from = SENDER.address;
    var m = CONTRACT.methods.mint(transfer.to, Math.floor(transfer.amount));
    console.log("sending " + m.encodeABI());
    return m.send({
        from: from,
        gas: 300000,
        gasPrice: web3.utils.toWei('50', "gwei")
    }).then(function (x) { return Promise.resolve(x); });
}
exports.sendEthToken = sendEthToken;
