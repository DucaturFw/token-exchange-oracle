"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var eosjs_1 = __importDefault(require("eosjs"));
var config_1 = __importDefault(require("../config"));
console.assert(config_1.default.eos.pk, "pk not found in config");
console.assert(config_1.default.eos.rpc, "rpc not found in config");
var config = {
    chainId: config_1.default.eos.chainId,
    // chainId: null,
    keyProvider: config_1.default.eos.pk,
    httpEndpoint: config_1.default.eos.rpc,
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
function getTableRows(code, scope, table, json, limit) {
    if (json === void 0) { json = true; }
    if (limit === void 0) { limit = 10000; }
    return exports.eos.getTableRows({
        code: code,
        scope: scope,
        table: table,
        limit: limit,
        json: json.toString()
    });
}
exports.getTableRows = getTableRows;
exports.getTokenBalance = function (account, tokenName) {
    if (tokenName === void 0) { tokenName = "SYS"; }
    return getTableRows(config_1.default.eos.defaults.eosio_token, account, "accounts")
        .then(function (res) { return res.rows
        .map(function (x) { return x.balance; })
        .filter(function (x) { return x && x.endsWith(tokenName); })
        .map(function (x) { return parseFloat(x.substr(0, x.length - 3)); })[0] || 0; });
};
function callContract(contract, method, args, extra) {
    return new Promise(function (resolve, reject) {
        exports.eos.contract(contract, extra, function (err, res) {
            if (err)
                return reject(err);
            var m = res[method];
            return m(args, extra).then(resolve).catch(reject);
        });
    });
}
exports.callContract = callContract;
