"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tools_1 = require("./tools");
var neo_1 = require("./neo/neo");
var eth_1 = require("./eth/eth");
var processed = {};
setInterval(_poll_, 1000);
function _poll_() {
    console.log("poll");
    var processors = {
        eth: eth_1.sendEthToken,
        neo: neo_1.sendNeoToken,
    };
    Promise.all([
        tools_1.ignoreError(tools_1.promisify(neo_1.getNeoTransfers), [], function (err) { return console.log("neo transfers couldn't be loaded: " + err); }),
        tools_1.ignoreError(tools_1.promisify(eth_1.getEthTransfers), [], function (err) { return console.log("eth transfers couldn't be loaded: " + err); }),
    ])
        .then(function (_) { return (console.log(_), _); })
        .then(function (results) { return results.reduce(function (acc, val) { return acc.concat(val); }, []); }) // flatten results
        .then(function (transfers) { return transfers.filter(function (trs) { return !processed[trs.tx]; }); }) // skip already processed transactions
        .then(function (transfers) {
        transfers.forEach(function (tx) {
            var p = processors[tx.blockchainTo];
            if (!p)
                return console.error("no such target blockchain! " + tx.blockchainTo);
            processed[tx.tx] = true;
            return p(tx);
        });
    })
        .catch(function (err) { return console.error(err); });
}
