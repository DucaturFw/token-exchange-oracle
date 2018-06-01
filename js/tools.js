"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function promisify(func) {
    return new Promise(function (resolve, reject) { return func(function (err, res) { return err ? reject(err) : resolve(res); }); });
}
exports.promisify = promisify;
function ignoreError(p, def, onError) {
    return p.catch(function (e) { return ((onError && onError(e)), def); });
}
exports.ignoreError = ignoreError;
