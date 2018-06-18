"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var eosjs_1 = __importDefault(require("eosjs"));
var confjs = require("../../data/config.json");
console.assert(confjs.eos.pk, "pk not found in config");
console.assert(confjs.eos.rpc, "rpc not found in config");
var config = {
    chainId: confjs.eos.chainId,
    // chainId: null,
    keyProvider: confjs.eos.pk,
    httpEndpoint: confjs.eos.rpc,
    // mockTransactions: () => 'pass', // or 'fail'
    /* transactionHeaders: (expireInSeconds: any, callback: (error: any, headers: any)) => {
        callback(undefined, headers)
    }, */
    expireInSeconds: 60,
    broadcast: false,
    // debug: false, // API and transactions
    // debug: true,
    sign: true,
};
exports.eos = eosjs_1.default(config);
exports.getTableRows = function (code, scope, table, json) {
    if (json === void 0) { json = true; }
    return exports.eos.getTableRows({
        code: code,
        scope: scope,
        table: table,
        json: json.toString()
    });
};
exports.getTokenBalance = function (account, tokenName) {
    if (tokenName === void 0) { tokenName = "SYS"; }
    return exports.getTableRows("eosio.token", account, "accounts")
        .then(function (res) { return res.rows
        .map(function (x) { return x.balance; })
        .filter(function (x) { return x && x.endsWith(tokenName); })
        .map(function (x) { return parseFloat(x.substr(0, x.length - 3)); })[0] || 0; });
};
