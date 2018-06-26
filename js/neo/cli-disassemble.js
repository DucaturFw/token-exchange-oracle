"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var neo_disassemble_1 = require("./neo-disassemble");
_start_();
function _start_() {
    var _a = process.argv, _1 = _a[0], _2 = _a[1], script = _a[2];
    if (!script)
        return console.log("NEO Disassemble\nUsage: yarn neo-disassemble <script>");
    console.log(neo_disassemble_1.disassemble(script));
}
