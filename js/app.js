"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tools_1 = require("./tools");
var eth_1 = require("./eth/eth");
var eos_1 = require("./eos/eos");
var storage_1 = require("./storage");
console.log("starting oracle...");
storage_1.getProcessed().then(function () {
    console.log("connected to storage provider, starting polling...");
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
            .then(function (transfers) { return transfers.filter(function (trs) { return !storage_1.isProcessed(trs.tx); }); }) // skip already processed transactions
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
                var next = function (cur) {
                    console.log('next');
                    return m(cur)
                        .then(function (val) { return storage_1.markProcessed(cur.tx)
                        .then(function () { return val; }); });
                };
                return bcTransfers[bc].reduce(function (prev, cur) { return prev
                    .then(function (x) { return (console.log("successfully sent tx#" + x), next(cur)); })
                    .catch(function (err) { return (console.error(err), next(cur)); }); }, Promise.resolve()).then(function (x) { return console.log("sent all " + bc.toUpperCase()); });
            })).then(function (x) { return (console.log('sent all transactions'), setTimeout(_poll_, 5000)); });
        })
            .catch(function (err) { return console.error(err); });
    }
}).catch(function (err) { return console.error(err); });
