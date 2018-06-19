"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var web3_1 = __importDefault(require("web3"));
var config_1 = __importDefault(require("../config"));
var ETH_ABI = require('../../data/ducatur-eth.abi.json');
var ETH_CONTRACT_ADDR = "0x16237cda239d9e368ab67dc4e5a28964759727ec";
ETH_CONTRACT_ADDR = "0x60903CDA8643805F9567a083C1734E139Fe7dAD2";
var web3 = new web3_1.default(new web3_1.default.providers.WebsocketProvider(config_1.default.eth.ws));
var events = [];
web3.eth.net.isListening().then(function (b) {
    // console.log(`connected: ${b}`)
    var ctr = new web3.eth.Contract(ETH_ABI, ETH_CONTRACT_ADDR);
    ctr.events.BlockchainExchange({ fromBlock: 0 }, function (err, ev) { return err ? console.error(err) : events.push(ev); });
}).catch(function (err) { return console.error(err); });
function eventToCXTransfer(event) {
    return {
        blockchainFrom: "eth",
        from: event.returnValues[0],
        amount: event.returnValues[1],
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
    return callback(undefined, events.map(eventToCXTransfer));
}
exports.getEthTransfers = getEthTransfers;
function sendEthToken(transfer) {
    // mint ETH tokens
    console.log("\n\n-----TRANSFER ETH-----\n");
    console.log(transfer);
    console.log("\n----------------------\n\n");
}
exports.sendEthToken = sendEthToken;
