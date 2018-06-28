"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("jest-extended");
var eth_1 = require("./eth");
var web3_1 = __importDefault(require("web3"));
var config_1 = __importDefault(require("../config"));
it('should get eth transfers', function (done) {
    eth_1.getEthTransfers(function (err, transfers) {
        expect(err).toBeFalsy();
        expect(transfers).toBeDefined();
        expect(transfers).toBeArray();
        // console.log(transfers)
        done();
    });
});
it('should transform private key to public', function () {
    var web3 = new web3_1.default();
    var addr = web3.eth.accounts.privateKeyToAccount(config_1.default.eth.owner_pk).address;
    expect(addr).toEqual("0xAd23AeB201fD9576809B3dEcA0Ac0ec21A2fE9a2");
});
