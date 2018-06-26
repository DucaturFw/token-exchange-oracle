"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("jest-extended");
var lib_1 = require("./lib");
var config_1 = __importDefault(require("../config"));
describe('neoscan getting info', function () {
    it('should get address transactions', function (done) {
        lib_1.get_last_transactions_by_address(config_1.default.neo.contractAddr, function (err, res) {
            expect(err).toBeFalsy();
            expect(res).toBeArray();
            if (!res)
                throw "undefined transaction result!";
            res.map(function (x) { return expect(x.txid).toBeString(); });
            done();
        });
    });
    it('should get transactions list', function (done) {
        lib_1.get_last_transactions_by_address(config_1.default.neo.contractAddr, function (err, res) {
            expect(err).toBeFalsy();
            expect(res).toBeArray();
            if (!res)
                throw "never";
            expect(res.length).toBeGreaterThan(0);
            lib_1.get_transactions(res.map(function (x) { return x.txid; })).then(function (txs) {
                expect(txs).toBeArray();
                expect(txs.length).toBeGreaterThan(0);
                expect(txs.length).toEqual(res.length);
                txs.map(function (x) { return expect(x).toMatchObject({ txid: expect.any(String), script: expect.any(String) }); });
                done();
            });
        });
    });
});
describe('applog getting info', function () {
    it('should get random app log', function (done) {
        var txid = "0x28ddfb25e0ca367f3344326fd78b4e34d8f10595057a22cf88de28b41e25f8d0";
        lib_1.getApplog(txid).then(function (tx) {
            done();
        });
    });
    it('should get correct app log', function (done) {
        var txid = "0x14ca7a93fdcf0a515dcef228cea3b1b4dcc35895e14322276166a02785520deb";
        lib_1.getApplog(txid).then(function (tx) {
            expect(tx).toBeDefined();
            expect(tx.txid).toEqual(txid);
            expect(tx.vmstate).toEqual("HALT, BREAK");
            expect(tx.stack).toBeArray();
            expect(tx.stack).not.toBeEmpty();
            var ret = tx.stack.pop();
            expect(ret).toBeDefined();
            if (!ret)
                return done("ret is null");
            expect(ret.type).toEqual("Integer");
            expect(ret.value).toEqual("1");
            done();
        });
    });
});
