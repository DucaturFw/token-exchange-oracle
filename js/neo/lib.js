"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var superagent_1 = __importDefault(require("superagent"));
var config_1 = __importDefault(require("../config"));
exports.NEO_API_URL = config_1.default.neo.apiUrl;
function apiUrl() {
    return exports.NEO_API_URL + "/api/main_net/v1/";
}
exports.apiUrl = apiUrl;
function get_last_transactions_by_address(address, callback) {
    superagent_1.default(apiUrl() + ("get_last_transactions_by_address/" + address))
        .end(function (err, res) {
        if (err)
            return callback(err, undefined);
        var txs = res.body;
        if (!txs || !Array.isArray(txs))
            return callback("not an array! " + txs, undefined);
        return callback(undefined, txs);
    });
}
exports.get_last_transactions_by_address = get_last_transactions_by_address;
function get_transaction(txid) {
    return superagent_1.default.get(apiUrl() + ("get_transaction/" + txid)).then(function (res) { return res.body; });
}
exports.get_transaction = get_transaction;
function get_transactions(txids) {
    return Promise.all(txids.map(get_transaction));
}
exports.get_transactions = get_transactions;
function getApplog(txid) {
    return superagent_1.default.get(config_1.default.neo.applog + "/tx/" + txid).then(function (x) { return x.body && x.body.tx; });
}
exports.getApplog = getApplog;
function getTxsWithLogs(txids) {
    return Promise.all([get_transactions(txids), Promise.all(txids.map(function (txid) { return getApplog(txid); }))])
        .then(function (_a) {
        var txs = _a[0], logs = _a[1];
        return txs.map(function (tx, idx) { return ({ tx: tx, log: logs[idx] }); });
    });
}
exports.getTxsWithLogs = getTxsWithLogs;
