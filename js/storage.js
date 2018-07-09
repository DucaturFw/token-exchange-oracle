"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var rethinkdb_1 = __importDefault(require("rethinkdb"));
var config_1 = __importDefault(require("./config"));
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
var connection;
var table;
function getProcessed() {
    return rethinkdb_1.default.connect(config_1.default.rethink).then(function (conn) {
        console.log('rethink: connected to db');
        connection = conn;
        table = rethinkdb_1.default.db('oracle').table('sentTxs');
        return table.changes({ includeInitial: true }).run(conn).then(function (cursor) {
            console.log('rethink: connected to table changes');
            return new Promise(function (res, rej) {
                cursor.each(function (err, row) {
                    if (err)
                        return console.error(err);
                    processed[row.new_val.txid] = true;
                }, function () { return res(processed); });
            });
        });
    });
}
exports.getProcessed = getProcessed;
function isProcessed(txid) {
    return processed[txid];
}
exports.isProcessed = isProcessed;
function markProcessed(txid) {
    return table.insert({ txid: txid }).run(connection);
}
exports.markProcessed = markProcessed;
