"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("jest-extended");
var lib_1 = require("./lib");
describe('Jungle', function () {
    var PUB_KEY = 'EOS6GRjeBum8jMgwjS91AMn6QmP6SrazRndhTAY797GbMaEqW7D5W';
    it('should get account from public key', function (done) {
        lib_1.eos.getKeyAccounts(PUB_KEY)
            .then(function (x) {
            expect(x.account_names).toIncludeAllMembers(['ducatur', 'ducaturtoken', 'duccntr']);
            done();
        })
            .catch(function (err) { return done(err); });
    });
});
