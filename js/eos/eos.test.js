"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var lib_1 = require("./lib");
var eosjs_1 = __importDefault(require("eosjs"));
it('should connect to testnet', function (done) {
    lib_1.eos.getInfo(function (err, res) {
        expect(err).toBeFalsy();
        done();
    });
}, 20000);
it('should get contract', function (done) {
    lib_1.eos.contract('l2dex.code', function (err, res) {
        expect(err).toBeFalsy();
        expect(res).toBeDefined();
        expect(res.fc).toBeDefined();
        expect(res.fc.abi).toBeDefined();
        done();
    });
}, 20000);
it('should open payment channel', function (done) {
    var auth = { authorization: "tester1", sign: true };
    var PK = require('../../data/config.json').eos.pk;
    lib_1.eos.contract('l2dex.code', auth, function (err, res) {
        expect(err).toBeFalsy();
        res.open({
            opener: 'tester1',
            pub_key: eosjs_1.default.modules.ecc.privateToPublic(PK),
            pair: "ETH",
            quantity: "1.0000 SYS",
            respondent: 'l2dex.code',
            resp_key: eosjs_1.default.modules.ecc.privateToPublic(PK),
        }).then(function (x) {
            // console.log(x)
            done();
        }).catch(function (err) { return done(err || "unknown promise error!"); });
    });
}, 40000);
it('should get table data', function (done) {
    lib_1.getTableRows("l2dex.code", "l2dex.code", "channels").then(function (x) {
        expect(x).toBeDefined();
        expect(x.rows).toBeDefined();
        expect(x.rows.length).toBeGreaterThan(0);
        console.log(x.rows[0]);
        done();
    }).catch(function (err) { return done(err || "unknown promise error!"); });
}, 20000);
