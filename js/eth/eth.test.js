"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("jest-extended");
var eth_1 = require("./eth");
it('should get eth transfers', function (done) {
    eth_1.getEthTransfers(function (err, transfers) {
        expect(err).toBeFalsy();
        expect(transfers).toBeDefined();
        expect(transfers).toBeArray();
        // console.log(transfers)
        done();
    });
});
