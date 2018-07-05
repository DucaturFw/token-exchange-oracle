"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tools_1 = require("./tools");
var eth_1 = require("./eth/eth");
var eos_1 = require("./eos/eos");
var processed = {
    'b1b0b7dc1a0b36bf8a2073f2406463aa65516deb131261462b8b7a36deb1f8f6': true,
    'b2daa1fefd2ae1d0d3896525c9b9b0d07ac24b2547c43d6fb8ec9e35d3f1428a': true,
    '3a95624ad301c3dcecd1401f87fae7d8b7d1ed887da7ae2f67f549fb668252f1': true,
    "7794a22afda0750fc25ca05ed4d0442346d89595670a75ca7dfdb9dd365b7126": true,
    "0": true,
    "1": true,
    "2": true,
    "3": true,
    "4": true,
    "5": true,
    "6": true,
    "7": true,
    "8": true,
    // "1": true,
    "0x74ab1dec2b138e8292edd33b3f82747968f9f8c70fa34889e181dbba932af4ed": true,
    "0x9cdc1bab13ff6abbf47155e6a745024c52c4a18d834952728ee7ab54bd1d52ed": true,
};
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
        var bcTransfers = transfers.reduce(function (acc, tx) {
            if (isNaN(tx.amount) || tx.amount <= 0)
                return console.error("tx amount is <= 0!"), console.error(tx), acc;
            var toBlock = (tx.blockchainTo || "").toLowerCase();
            (acc[toBlock] || (acc[toBlock] = [])).push(tx);
            return acc;
        }, {});
        Promise.all(Object.keys(bcTransfers).map(function (bc) {
            var m = processors[bc];
            if (!m)
                return console.error("no such target blockchain! " + bc), Promise.resolve();
            var next = function (cur) { return (console.log('next'), processed[cur.tx] = true, m(cur)); };
            return bcTransfers[bc].reduce(function (prev, cur) { return prev
                .then(function (x) { return (console.log("successfully sent tx#" + x), next(cur)); })
                .catch(function (err) { return (console.error(err), next(cur)); }); }, Promise.resolve()).then(function (x) { return console.log("sent all " + bc.toUpperCase()); });
        })).then(function (x) { return (console.log('sent all transactions'), setTimeout(_poll_, 1000)); });
    })
        .catch(function (err) { return console.error(err); });
}
