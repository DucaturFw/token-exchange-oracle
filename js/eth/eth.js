"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ETH_API_URL = "";
var ETH_ABI = require('../data/ducatur-eth.abi');
var ETH_CONTRACT_ADDR = "0x16237cda239d9e368ab67dc4e5a28964759727ec";
function getEthTransfers(callback) {
    // get ETH transfers from public API
    return callback("not implemented!", undefined);
}
exports.getEthTransfers = getEthTransfers;
function sendEthToken(transfer) {
    // mint ETH tokens
}
exports.sendEthToken = sendEthToken;
