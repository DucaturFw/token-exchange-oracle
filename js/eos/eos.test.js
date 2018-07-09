"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("jest-extended");
var lib = require("./lib");
var eos_1 = require("./eos");
describe('getEosTransfers with mocked getTableRows', function () {
    it('should parse empty mocked data', function (done) {
        lib.getTableRows = jest.fn(function () { return Promise.resolve({ rows: [] }); });
        eos_1.getEosTransfers(function (err, transfers) {
            expect(lib.getTableRows).toHaveBeenCalledTimes(1);
            expect(err).toBeFalsy();
            expect(transfers).toBeDefined();
            if (!transfers)
                return;
            expect(transfers).toBeEmpty();
            expect(transfers).toBeArrayOfSize(0);
            done();
        });
    });
    it('should parse mocked data', function (done) {
        var MOCKED_DATA = [{
                id: 0,
                from: 'tester2',
                to: '0x12345678',
                amount: '50.0000 DUCAT',
                blockchain: 'eth',
                pubtime: '2018-06-19T17:05:34',
                txid: '',
            }];
        lib.getTableRows = jest.fn(function () { return Promise.resolve({ rows: MOCKED_DATA }); });
        eos_1.getEosTransfers(function (err, transfers) {
            expect(lib.getTableRows).toHaveBeenCalledTimes(1);
            expect(err).toBeFalsy();
            expect(transfers).toBeDefined();
            if (!transfers)
                return;
            expect(transfers).toBeArrayOfSize(1);
            expect(transfers[0]).toMatchObject({
                amount: expect.any(Number),
                blockchainFrom: "eos",
                blockchainTo: "eth",
                from: "tester2",
                to: "0x12345678",
                tx: '0'
            });
            expect(transfers[0].amount).toBeCloseTo(50);
            done();
        });
    });
});
