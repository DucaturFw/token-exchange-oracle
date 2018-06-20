"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("jest-extended");
var lib_1 = require("./lib");
var eosjs_1 = __importDefault(require("eosjs"));
var config_1 = __importDefault(require("../config"));
jest.setTimeout(20000);
it('should connect to testnet', function (done) {
    lib_1.eos.getInfo(function (err, res) {
        expect(err).toBeFalsy();
        expect(res).toBeDefined();
        done();
    });
});
it('should get contract', function (done) {
    lib_1.eos.contract('l2dex.code', function (err, res) {
        expect(err).toBeFalsy();
        expect(res).toBeDefined();
        expect(res.fc).toBeDefined();
        expect(res.fc.abi).toBeDefined();
        done();
    });
});
it('should open payment channel', function (done) {
    var auth = { authorization: "tester1", sign: true };
    var PK = config_1.default.eos.pk;
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
        // console.log(x.rows[0])
        done();
    }).catch(function (err) { return done(err || "unknown promise error!"); });
});
it('should read tokens balance', function (done) {
    lib_1.getTokenBalance("tester1", "SYS").then(function (balance) {
        expect(balance).toBeNumber();
        expect(balance).toBeGreaterThanOrEqual(0);
        done();
    });
});
it('should mint tokens', function (done) {
    var auth = { authorization: "eosio", sign: true, broadcast: true, debug: true };
    var PK = config_1.default.eos.pk;
    lib_1.getTokenBalance("tester1", "SYS").then(function (oldBalance) {
        expect(oldBalance).toBeNumber();
        lib_1.eos.contract("eosio.token", function (err, res) {
            expect(err).toBeFalsy();
            expect(res).toBeDefined();
            res.issue({
                to: "tester1",
                quantity: "1.0000 SYS",
                memo: "eos.test." + Math.floor(Math.random() * 10000)
            }, auth).then(function (__) {
                setTimeout(function () { return lib_1.getTokenBalance("tester1", "SYS").then(function (newBalance) {
                    expect(newBalance).toBeNumber();
                    expect(newBalance).toBeGreaterThan(oldBalance);
                    expect(newBalance).toEqual(oldBalance + 1);
                    done();
                }); }, 500);
            });
        });
    });
});
