"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var web3_1 = __importDefault(require("web3"));
var config_1 = __importDefault(require("../config"));
var rethinkdb_1 = __importDefault(require("rethinkdb"));
var ETH_ABI = require('../../data/ducatur-eth.abi.json');
var DUCAT_PRECISION = 1e4;
var web3;
var CONTRACT;
var SENDER;
var events = [];
function init() {
    if (web3)
        return;
    web3 = new web3_1.default(new web3_1.default.providers.HttpProvider(config_1.default.eth.https));
    rethinkdb_1.default.connect(config_1.default.rethink).then(function (connection) {
        console.log("connected ETH!");
        CONTRACT = new web3.eth.Contract(ETH_ABI, config_1.default.eth.contractAddr);
        SENDER = web3.eth.accounts.privateKeyToAccount(config_1.default.eth.owner_pk);
        web3.eth.accounts.wallet.add(SENDER);
        rethinkdb_1.default.db('ethereum').table('contractCalls')
            .orderBy({
            index: rethinkdb_1.default.desc('chronological')
        })
            .filter({
            event: "BlockchainExchange",
            address: config_1.default.eth.contractAddr
        })
            .changes({ includeInitial: true })
            .run(connection)
            .then(function (cursor) {
            cursor.each(function (err, row) {
                if (err)
                    return console.error(err);
                events.push(row.new_val);
            });
        });
    });
}
exports.init = init;
function eventToCXTransfer(event) {
    return {
        blockchainFrom: "eth",
        from: event.returnValues[0],
        amount: parseFloat(event.returnValues[1]),
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
var isConnected = function () { return !!CONTRACT; };
function getEthTransfers(callback) {
    if (!web3)
        init();
    if (isConnected())
        setTimeout(function () { return callback(undefined, events.map(eventToCXTransfer)); }, 1);
    else
        setTimeout(function () { return getEthTransfers(callback); }, 20);
}
exports.getEthTransfers = getEthTransfers;
function sendEthToken(transfer) {
    // mint ETH tokens
    console.log("\n\n-----TRANSFER ETH-----\n");
    console.log(transfer);
    console.log("\n----------------------\n\n");
    // return
    var from = SENDER.address;
    var m = CONTRACT.methods.mint(transfer.to, Math.floor(transfer.amount * DUCAT_PRECISION));
    // let abi = m.encodeABI()
    // m.estimateGas({gas:1e18.toString()}).then(x => console.log(x))
    // return
    // ctr.methods.totalSupply().call().then(x => console.log(`total supply: ${x}`))
    m.send({
        from: from,
        gas: 300000,
        gasPrice: 5
    }).then(function (x) { return console.log(x); }).catch(function (err) { return console.error(err); });
    /* return

    web3.eth.signTransaction({
        from,
        data: abi,
    }).then(x => console.log(x)).catch(err => console.error(err))
    return
    web3.eth.sendTransaction({
        to: appConfig.eth.contractAddr,
        from,
        data: abi
    }).then(x => console.log(x)).catch(err => console.error(err)) */
    // 0x40c10f1900000000000000000000000060903cda8643805f9567a083c1734e139fe7dad20000000000000000000000000000000000000000000000000000000000000000
}
exports.sendEthToken = sendEthToken;
