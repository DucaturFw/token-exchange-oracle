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
