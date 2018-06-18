"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function disassemble(script) {
    function readByte() {
        return bytes[i++];
    }
    function readBytes(len) {
        return bytes.slice(i, i += len); //.toString('hex')
    }
    function readUInt16() {
        var uint = bytes.readUInt16LE(i);
        i += 2;
        return uint;
    }
    function readUInt32() {
        var uint = bytes.readUInt32LE(i);
        i += 4;
        return uint;
    }
    function readInt16() {
        var int = bytes.readInt16LE(i);
        i += 2;
        return int;
    }
    function readInt32() {
        var int = bytes.readInt32LE(i);
        i += 4;
        return int;
    }
    var entries = [];
    var bytes = new Buffer(script, 'hex');
    var i = 0;
    while (i < (bytes.length - 1)) {
        var opcode = readByte();
        var entry = {
            opcode: opcode,
            pos: i - 1,
            name: OpCode[opcode],
            comment: exports.hints[opcode],
        };
        if (opcode >= OpCode.PUSHBYTES1 && opcode <= OpCode.PUSHBYTES75) {
            var len = opcode;
            entry.data = readBytes(len);
            entry.name = "PUSHBYTES" + len;
            entry.comment = "Pushes " + len + " bytes into the stack: $$";
        }
        else if ((opcode >= OpCode.PUSH1 && opcode <= OpCode.PUSH16) || (opcode == OpCode.PUSH0)) {
            entry.int = opcode && (opcode - OpCode.PUSH1 + 1);
            entry.data = new Buffer([entry.int]);
        }
        else
            switch (opcode) {
                // Push value
                //case OpCode.PUSH0:
                case OpCode.PUSHDATA1:
                    {
                        var len = readByte();
                        entry.data = readBytes(len);
                        entry.comment = "Pushes " + len + " bytes into the stack: $$";
                        break;
                    }
                case OpCode.PUSHDATA2:
                    {
                        var len = readUInt16();
                        entry.data = readBytes(len);
                        entry.comment = "Pushes " + len + " bytes into the stack: $$";
                        break;
                    }
                case OpCode.PUSHDATA4:
                    {
                        var len = readInt32();
                        entry.data = readBytes(len);
                        entry.comment = "Pushes " + len + " bytes into the stack: $$";
                        break;
                    }
                /*case OpCode.PUSHM1:
                case OpCode.PUSH1:
                case OpCode.PUSH2:
                case OpCode.PUSH3:
                case OpCode.PUSH4:
                case OpCode.PUSH5:
                case OpCode.PUSH6:
                case OpCode.PUSH7:
                case OpCode.PUSH8:
                case OpCode.PUSH9:
                case OpCode.PUSH10:
                case OpCode.PUSH11:
                case OpCode.PUSH12:
                case OpCode.PUSH13:
                case OpCode.PUSH14:
                case OpCode.PUSH15:
                case OpCode.PUSH16:*/
                // Control
                //case OpCode.NOP:
                case OpCode.JMP:
                case OpCode.JMPIF:
                case OpCode.JMPIFNOT:
                    {
                        var offset = readInt16();
                        //offset = context.InstructionPointer + offset - 3
                        break;
                    }
                /*case OpCode.CALL:
                    InvocationStack.Push(context.Clone());
                    context.InstructionPointer += 2;
                    ExecuteOp(OpCode.JMP, CurrentContext);
                    break;*/
                /*case OpCode.RET:
                    InvocationStack.Pop().Dispose();
                    if (InvocationStack.Count == 0)
                        State |= VMState.HALT;
                    break;*/
                case OpCode.APPCALL:
                case OpCode.TAILCALL:
                    {
                        var script_hash = readBytes(20);
                        entry.data = script_hash;
                        entry.comment = "Calls script with hash: $XX";
                        break;
                    }
                case OpCode.SYSCALL:
                    {
                        entry.data = readBytes(252);
                        entry.comment = "System call with data: $$";
                        break;
                    }
                // Stack ops
                /*case OpCode.DUPFROMALTSTACK:
                case OpCode.TOALTSTACK:
                case OpCode.FROMALTSTACK:
                case OpCode.XDROP:
                case OpCode.XSWAP:
                case OpCode.XTUCK:
                case OpCode.DEPTH:
                case OpCode.DROP:
                case OpCode.DUP:
                case OpCode.NIP:
                case OpCode.OVER:
                case OpCode.PICK:
                case OpCode.ROLL:
                case OpCode.ROT:
                case OpCode.SWAP:
                case OpCode.TUCK:
                case OpCode.CAT:
                case OpCode.SUBSTR:
                case OpCode.LEFT:
                case OpCode.RIGHT:
                case OpCode.SIZE:
                    */
                // Bitwise logic
                /*case OpCode.INVERT:
                case OpCode.AND:
                case OpCode.OR:
                case OpCode.XOR:
                case OpCode.EQUAL:
    |                            */
                // Numeric
                /*case OpCode.INC:
                case OpCode.DEC:
                case OpCode.SIGN:
                case OpCode.NEGATE:
                case OpCode.ABS:
                case OpCode.NOT:
                case OpCode.NZ:
                case OpCode.ADD:
                case OpCode.SUB:
                case OpCode.MUL:
                case OpCode.DIV:
                case OpCode.MOD:
                case OpCode.SHL:
                case OpCode.SHR:
                case OpCode.BOOLAND:
                case OpCode.BOOLOR:
                case OpCode.NUMEQUAL:
                case OpCode.NUMNOTEQUAL:
                case OpCode.LT:
                case OpCode.GT:
                case OpCode.LTE:
                case OpCode.GTE:
                case OpCode.MIN:
                case OpCode.MAX:
                case OpCode.WITHIN:
                    */
                // Crypto
                /*
                case OpCode.SHA1:
                case OpCode.SHA256:
                case OpCode.HASH160:
                case OpCode.HASH256:
                case OpCode.CHECKSIG:
                case OpCode.CHECKMULTISIG:
                case OpCode.ARRAYSIZE:
                case OpCode.PACK:
                case OpCode.UNPACK:
                case OpCode.PICKITEM:
                case OpCode.SETITEM:
                case OpCode.NEWARRAY:
                case OpCode.NEWSTRUCT:
                */
                // Exceptions
                /*case OpCode.THROW:
                case OpCode.THROWIFNOT:
                */
                default:
                    {
                        if (!OpCode[opcode]) {
                            entry.name = "???";
                            entry.comment = "Invalid opcode!!";
                        }
                        break;
                    }
            }
        entry.hex = entry.data && entry.data.toString('hex');
        entries.push(entry);
    }
    return entries;
}
exports.disassemble = disassemble;
var OpCode;
(function (OpCode) {
    // Constants
    OpCode[OpCode["PUSH0"] = 0] = "PUSH0";
    OpCode[OpCode["PUSHF"] = 0] = "PUSHF";
    OpCode[OpCode["PUSHBYTES1"] = 1] = "PUSHBYTES1";
    OpCode[OpCode["PUSHBYTES75"] = 75] = "PUSHBYTES75";
    OpCode[OpCode["PUSHDATA1"] = 76] = "PUSHDATA1";
    OpCode[OpCode["PUSHDATA2"] = 77] = "PUSHDATA2";
    OpCode[OpCode["PUSHDATA4"] = 78] = "PUSHDATA4";
    OpCode[OpCode["PUSHM1"] = 79] = "PUSHM1";
    OpCode[OpCode["PUSH1"] = 81] = "PUSH1";
    OpCode[OpCode["PUSHT"] = 81] = "PUSHT";
    OpCode[OpCode["PUSH2"] = 82] = "PUSH2";
    OpCode[OpCode["PUSH3"] = 83] = "PUSH3";
    OpCode[OpCode["PUSH4"] = 84] = "PUSH4";
    OpCode[OpCode["PUSH5"] = 85] = "PUSH5";
    OpCode[OpCode["PUSH6"] = 86] = "PUSH6";
    OpCode[OpCode["PUSH7"] = 87] = "PUSH7";
    OpCode[OpCode["PUSH8"] = 88] = "PUSH8";
    OpCode[OpCode["PUSH9"] = 89] = "PUSH9";
    OpCode[OpCode["PUSH10"] = 90] = "PUSH10";
    OpCode[OpCode["PUSH11"] = 91] = "PUSH11";
    OpCode[OpCode["PUSH12"] = 92] = "PUSH12";
    OpCode[OpCode["PUSH13"] = 93] = "PUSH13";
    OpCode[OpCode["PUSH14"] = 94] = "PUSH14";
    OpCode[OpCode["PUSH15"] = 95] = "PUSH15";
    OpCode[OpCode["PUSH16"] = 96] = "PUSH16";
    // Flow control
    OpCode[OpCode["NOP"] = 97] = "NOP";
    OpCode[OpCode["JMP"] = 98] = "JMP";
    OpCode[OpCode["JMPIF"] = 99] = "JMPIF";
    OpCode[OpCode["JMPIFNOT"] = 100] = "JMPIFNOT";
    OpCode[OpCode["CALL"] = 101] = "CALL";
    OpCode[OpCode["RET"] = 102] = "RET";
    OpCode[OpCode["APPCALL"] = 103] = "APPCALL";
    OpCode[OpCode["SYSCALL"] = 104] = "SYSCALL";
    OpCode[OpCode["TAILCALL"] = 105] = "TAILCALL";
    // Stack
    OpCode[OpCode["DUPFROMALTSTACK"] = 106] = "DUPFROMALTSTACK";
    OpCode[OpCode["TOALTSTACK"] = 107] = "TOALTSTACK";
    OpCode[OpCode["FROMALTSTACK"] = 108] = "FROMALTSTACK";
    OpCode[OpCode["XDROP"] = 109] = "XDROP";
    OpCode[OpCode["XSWAP"] = 114] = "XSWAP";
    OpCode[OpCode["XTUCK"] = 115] = "XTUCK";
    OpCode[OpCode["DEPTH"] = 116] = "DEPTH";
    OpCode[OpCode["DROP"] = 117] = "DROP";
    OpCode[OpCode["DUP"] = 118] = "DUP";
    OpCode[OpCode["NIP"] = 119] = "NIP";
    OpCode[OpCode["OVER"] = 120] = "OVER";
    OpCode[OpCode["PICK"] = 121] = "PICK";
    OpCode[OpCode["ROLL"] = 122] = "ROLL";
    OpCode[OpCode["ROT"] = 123] = "ROT";
    OpCode[OpCode["SWAP"] = 124] = "SWAP";
    OpCode[OpCode["TUCK"] = 125] = "TUCK";
    // Splice
    OpCode[OpCode["CAT"] = 126] = "CAT";
    OpCode[OpCode["SUBSTR"] = 127] = "SUBSTR";
    OpCode[OpCode["LEFT"] = 128] = "LEFT";
    OpCode[OpCode["RIGHT"] = 129] = "RIGHT";
    OpCode[OpCode["SIZE"] = 130] = "SIZE";
    // Bitwise logic
    OpCode[OpCode["INVERT"] = 131] = "INVERT";
    OpCode[OpCode["AND"] = 132] = "AND";
    OpCode[OpCode["OR"] = 133] = "OR";
    OpCode[OpCode["XOR"] = 134] = "XOR";
    OpCode[OpCode["EQUAL"] = 135] = "EQUAL";
    //OP_EQUALVERIFY = 0x88, // Same as OP_EQUAL, but runs OP_VERIFY afterward.
    //OP_RESERVED1 = 0x89, // Transaction is invalid unless occuring in an unexecuted OP_IF branch
    //OP_RESERVED2 = 0x8A, // Transaction is invalid unless occuring in an unexecuted OP_IF branch
    // Arithmetic
    // Note: Arithmetic inputs are limited to signed 32-bit integers, but may overflow their output.
    OpCode[OpCode["INC"] = 139] = "INC";
    OpCode[OpCode["DEC"] = 140] = "DEC";
    OpCode[OpCode["SIGN"] = 141] = "SIGN";
    OpCode[OpCode["NEGATE"] = 143] = "NEGATE";
    OpCode[OpCode["ABS"] = 144] = "ABS";
    OpCode[OpCode["NOT"] = 145] = "NOT";
    OpCode[OpCode["NZ"] = 146] = "NZ";
    OpCode[OpCode["ADD"] = 147] = "ADD";
    OpCode[OpCode["SUB"] = 148] = "SUB";
    OpCode[OpCode["MUL"] = 149] = "MUL";
    OpCode[OpCode["DIV"] = 150] = "DIV";
    OpCode[OpCode["MOD"] = 151] = "MOD";
    OpCode[OpCode["SHL"] = 152] = "SHL";
    OpCode[OpCode["SHR"] = 153] = "SHR";
    OpCode[OpCode["BOOLAND"] = 154] = "BOOLAND";
    OpCode[OpCode["BOOLOR"] = 155] = "BOOLOR";
    OpCode[OpCode["NUMEQUAL"] = 156] = "NUMEQUAL";
    OpCode[OpCode["NUMNOTEQUAL"] = 158] = "NUMNOTEQUAL";
    OpCode[OpCode["LT"] = 159] = "LT";
    OpCode[OpCode["GT"] = 160] = "GT";
    OpCode[OpCode["LTE"] = 161] = "LTE";
    OpCode[OpCode["GTE"] = 162] = "GTE";
    OpCode[OpCode["MIN"] = 163] = "MIN";
    OpCode[OpCode["MAX"] = 164] = "MAX";
    OpCode[OpCode["WITHIN"] = 165] = "WITHIN";
    // Crypto
    //RIPEMD160 = 0xA6, // The input is hashed using RIPEMD-160.
    OpCode[OpCode["SHA1"] = 167] = "SHA1";
    OpCode[OpCode["SHA256"] = 168] = "SHA256";
    OpCode[OpCode["HASH160"] = 169] = "HASH160";
    OpCode[OpCode["HASH256"] = 170] = "HASH256";
    OpCode[OpCode["CHECKSIG"] = 172] = "CHECKSIG";
    OpCode[OpCode["CHECKMULTISIG"] = 174] = "CHECKMULTISIG";
    // Array
    OpCode[OpCode["ARRAYSIZE"] = 192] = "ARRAYSIZE";
    OpCode[OpCode["PACK"] = 193] = "PACK";
    OpCode[OpCode["UNPACK"] = 194] = "UNPACK";
    OpCode[OpCode["PICKITEM"] = 195] = "PICKITEM";
    OpCode[OpCode["SETITEM"] = 196] = "SETITEM";
    OpCode[OpCode["NEWARRAY"] = 197] = "NEWARRAY";
    OpCode[OpCode["NEWSTRUCT"] = 198] = "NEWSTRUCT";
    // Exceptions
    OpCode[OpCode["THROW"] = 240] = "THROW";
    OpCode[OpCode["THROWIFNOT"] = 241] = "THROWIFNOT";
})(OpCode = exports.OpCode || (exports.OpCode = {}));
exports.hints = {};
// Constants
exports.hints[OpCode.PUSH0] = "An empty array of bytes is pushed onto the stack.";
exports.hints[OpCode.PUSHF] = exports.hints[OpCode.PUSH0];
exports.hints[OpCode.PUSHBYTES1] = /*0x01-0x4B*/ "The next opcode bytes is data to be pushed onto the stack";
exports.hints[OpCode.PUSHBYTES75] = "";
exports.hints[OpCode.PUSHDATA1] = "The next byte contains the number of bytes to be pushed onto the stack.";
exports.hints[OpCode.PUSHDATA2] = "The next two bytes contain the number of bytes to be pushed onto the stack.";
exports.hints[OpCode.PUSHDATA4] = "The next four bytes contain the number of bytes to be pushed onto the stack.";
exports.hints[OpCode.PUSHM1] = "The number -1 is pushed onto the stack.";
exports.hints[OpCode.PUSH1] = "The number 1 is pushed onto the stack.";
exports.hints[OpCode.PUSHT] = exports.hints[OpCode.PUSH1];
exports.hints[OpCode.PUSH2] = "The number 2 is pushed onto the stack.";
exports.hints[OpCode.PUSH3] = "The number 3 is pushed onto the stack.";
exports.hints[OpCode.PUSH4] = "The number 4 is pushed onto the stack.";
exports.hints[OpCode.PUSH5] = "The number 5 is pushed onto the stack.";
exports.hints[OpCode.PUSH6] = "The number 6 is pushed onto the stack.";
exports.hints[OpCode.PUSH7] = "The number 7 is pushed onto the stack.";
exports.hints[OpCode.PUSH8] = "The number 8 is pushed onto the stack.";
exports.hints[OpCode.PUSH9] = "The number 9 is pushed onto the stack.";
exports.hints[OpCode.PUSH10] = "The number 10 is pushed onto the stack.";
exports.hints[OpCode.PUSH11] = "The number 11 is pushed onto the stack.";
exports.hints[OpCode.PUSH12] = "The number 12 is pushed onto the stack.";
exports.hints[OpCode.PUSH13] = "The number 13 is pushed onto the stack.";
exports.hints[OpCode.PUSH14] = "The number 14 is pushed onto the stack.";
exports.hints[OpCode.PUSH15] = "The number 15 is pushed onto the stack.";
exports.hints[OpCode.PUSH16] = "The number 16 is pushed onto the stack.";
// Flow control
exports.hints[OpCode.NOP] = "Does nothing.";
exports.hints[OpCode.JMP] = "";
exports.hints[OpCode.JMPIF] = "";
exports.hints[OpCode.JMPIFNOT] = "";
exports.hints[OpCode.CALL] = "";
exports.hints[OpCode.RET] = "";
exports.hints[OpCode.APPCALL] = "";
exports.hints[OpCode.SYSCALL] = "";
exports.hints[OpCode.TAILCALL] = "";
// Stack
exports.hints[OpCode.DUPFROMALTSTACK] = "";
exports.hints[OpCode.TOALTSTACK] = "Puts the input onto the top of the alt stack. Removes it from the main stack.";
exports.hints[OpCode.FROMALTSTACK] = "Puts the input onto the top of the main stack. Removes it from the alt stack.";
exports.hints[OpCode.XDROP] = "";
exports.hints[OpCode.XSWAP] = "";
exports.hints[OpCode.XTUCK] = "";
exports.hints[OpCode.DEPTH] = "Puts the number of stack items onto the stack.";
exports.hints[OpCode.DROP] = "Removes the top stack item.";
exports.hints[OpCode.DUP] = "Duplicates the top stack item.";
exports.hints[OpCode.NIP] = "Removes the second-to-top stack item.";
exports.hints[OpCode.OVER] = "Copies the second-to-top stack item to the top.";
exports.hints[OpCode.PICK] = "The item in back in the stack is copied to the top.";
exports.hints[OpCode.ROLL] = "The item in back in the stack is moved to the top.";
exports.hints[OpCode.ROT] = "The top three items on the stack are rotated to the left.";
exports.hints[OpCode.SWAP] = "The top two items on the stack are swapped.";
exports.hints[OpCode.TUCK] = "The item at the top of the stack is copied and inserted before the second-to-top item.";
// Splice
exports.hints[OpCode.CAT] = "Concatenates two strings.";
exports.hints[OpCode.SUBSTR] = "Returns a section of a string.";
exports.hints[OpCode.LEFT] = "Keeps only characters left of the specified point in a string.";
exports.hints[OpCode.RIGHT] = "Keeps only characters right of the specified point in a string.";
exports.hints[OpCode.SIZE] = "Returns the length of the input string.";
// Bitwise logic
exports.hints[OpCode.INVERT] = "Flips all of the bits in the input.";
exports.hints[OpCode.AND] = "Boolean and between each bit in the inputs.";
exports.hints[OpCode.OR] = "Boolean or between each bit in the inputs.";
exports.hints[OpCode.XOR] = "Boolean exclusive or between each bit in the inputs.";
exports.hints[OpCode.EQUAL] = "Returns 1 if the inputs are exactly equal, 0 otherwise.";
//OP_EQUALVERIFY = 0x88, // Same as OP_EQUAL, but runs OP_VERIFY afterward.
//OP_RESERVED1 = 0x89, // Transaction is invalid unless occuring in an unexecuted OP_IF branch
//OP_RESERVED2 = 0x8A, // Transaction is invalid unless occuring in an unexecuted OP_IF branch
// Arithmetic
// Note: Arithmetic inputs are limited to signed 32-bit integers, but may overflow their output.
exports.hints[OpCode.INC] = "1 is added to the input.";
exports.hints[OpCode.DEC] = "1 is subtracted from the input.";
exports.hints[OpCode.SIGN] = "";
exports.hints[OpCode.NEGATE] = "The sign of the input is flipped.";
exports.hints[OpCode.ABS] = "The input is made positive.";
exports.hints[OpCode.NOT] = "If the input is 0 or 1, it is flipped. Otherwise the output will be 0.";
exports.hints[OpCode.NZ] = "Returns 0 if the input is 0. 1 otherwise.";
exports.hints[OpCode.ADD] = "a is added to b.";
exports.hints[OpCode.SUB] = "b is subtracted from a.";
exports.hints[OpCode.MUL] = "a is multiplied by b.";
exports.hints[OpCode.DIV] = "a is divided by b.";
exports.hints[OpCode.MOD] = "Returns the remainder after dividing a by b.";
exports.hints[OpCode.SHL] = "Shifts a left b bits, preserving sign.";
exports.hints[OpCode.SHR] = "Shifts a right b bits, preserving sign.";
exports.hints[OpCode.BOOLAND] = "If both a and b are not 0, the output is 1. Otherwise 0.";
exports.hints[OpCode.BOOLOR] = "If a or b is not 0, the output is 1. Otherwise 0.";
exports.hints[OpCode.NUMEQUAL] = "Returns 1 if the numbers are equal, 0 otherwise.";
exports.hints[OpCode.NUMNOTEQUAL] = "Returns 1 if the numbers are not equal, 0 otherwise.";
exports.hints[OpCode.LT] = "Returns 1 if a is less than b, 0 otherwise.";
exports.hints[OpCode.GT] = "Returns 1 if a is greater than b, 0 otherwise.";
exports.hints[OpCode.LTE] = "Returns 1 if a is less than or equal to b, 0 otherwise.";
exports.hints[OpCode.GTE] = "Returns 1 if a is greater than or equal to b, 0 otherwise.";
exports.hints[OpCode.MIN] = "Returns the smaller of a and b.";
exports.hints[OpCode.MAX] = "Returns the larger of a and b.";
exports.hints[OpCode.WITHIN] = "Returns 1 if x is within the specified range (left-inclusive), 0 otherwise.";
// Crypto
//hints[OpCode.RIPEMD160 = 0xA6, // The input is hashed using RIPEMD-160.
exports.hints[OpCode.SHA1] = ""; // The input is hashed using SHA-1.
exports.hints[OpCode.SHA256] = ""; // The input is hashed using SHA-256.
exports.hints[OpCode.HASH160] = "";
exports.hints[OpCode.HASH256] = "";
exports.hints[OpCode.CHECKSIG] = "";
exports.hints[OpCode.CHECKMULTISIG] = "";
// Array
exports.hints[OpCode.ARRAYSIZE] = "ARRAYSIZE";
exports.hints[OpCode.PACK] = "PACK";
exports.hints[OpCode.UNPACK] = "UNPACK";
exports.hints[OpCode.PICKITEM] = "Pops index and array from stack, then push the item in the array index to the stack";
exports.hints[OpCode.SETITEM] = "Pops newItem, index and array from stack, then copy the newItem to the array value at index";
exports.hints[OpCode.NEWARRAY] = "Pops size from stack and creates a new array with that size, and pushes the array into the stack";
exports.hints[OpCode.NEWSTRUCT] = " as value type ";
// Exceptions
exports.hints[OpCode.THROW] = "";
exports.hints[OpCode.THROWIFNOT] = "";
