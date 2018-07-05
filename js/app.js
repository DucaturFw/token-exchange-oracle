"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tools_1 = require("./tools");
var neo_1 = require("./neo/neo");
var eth_1 = require("./eth/eth");
var eos_1 = require("./eos/eos");
var processed = { };
_poll_();
function _poll_() {
    console.log("poll " + new Date().toISOString());
    var processors = {
        eth: eth_1.sendEthToken,
        // neo: sendNeoToken,
        eos: eos_1.sendEosToken,
    };
    Promise.all([
        // ignoreError(promisify(getNeoTransfers), [], err => console.log(`neo transfers couldn't be loaded: ${err}`)),
        tools_1.ignoreError(tools_1.promisify(eth_1.getEthTransfers), [], function (err) { return console.log("eth transfers couldn't be loaded: " + err); }),
        tools_1.ignoreError(tools_1.promisify(eos_1.getEosTransfers), [], function (err) { return console.log("eos transfers couldn't be loaded: " + err); }),
    ])
        // .then(_ => (console.log(_), _))
        .then(function (results) { return results.reduce(function (acc, val) { return acc.concat(val); }, []); }) // flatten results
        .then(function (transfers) { return transfers.filter(function (trs) { return !processed[trs.tx]; }); }) // skip already processed transactions
        .then(function (transfers) {
        // console.log(transfers)
        transfers.forEach(function (tx) {
            if (isNaN(tx.amount) || tx.amount <= 0)
                return console.error("tx amount is <= 0!"), console.error(tx);
            var toBlock = (tx.blockchainTo || "").toLowerCase();
            var p = processors[toBlock];
            if (!p)
                return console.error("no such target blockchain! " + tx.blockchainTo);
            processed[tx.tx] = true;
            return p(tx);
        });
        setTimeout(_poll_, 1000);
    })
        .catch(function (err) { return console.error(err); });
}
