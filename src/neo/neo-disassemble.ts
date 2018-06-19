export interface IEntry
{
	opcode: number
	pos: number
	name: string
	comment: string
	data?: Buffer
	hex?: string
	int?: number
}
export function disassemble(script: string)
{
	function readByte()
	{
		return bytes[i++]
	}
	function readBytes(len: number)
	{
		return bytes.slice(i, i += len)//.toString('hex')
	}
	function readUInt16()
	{
		let uint = bytes.readUInt16LE(i)
		i += 2
		return uint
	}
	function readUInt32()
	{
		let uint = bytes.readUInt32LE(i)
		i += 4
		return uint
	}
	function readInt16()
	{
		let int = bytes.readInt16LE(i)
		i += 2
		return int
	}
	function readInt32()
	{
		let int = bytes.readInt32LE(i)
		i += 4
		return int
	}

	let entries = []
	let bytes = Buffer.from(script, 'hex')
	let i = 0
	while (i < (bytes.length - 1))
	{
		let opcode = readByte()

		let entry: IEntry = {
			opcode,
			pos: i - 1,
			name: OpCode[opcode],
			comment: hints[opcode],
		}
		if (opcode >= OpCode.PUSHBYTES1 && opcode <= OpCode.PUSHBYTES75)
		{
			let len = opcode
			entry.data = readBytes(len)
			entry.name = `PUSHBYTES${len}`
			entry.comment = `Pushes ${len} bytes into the stack: $$`
		}
		else
		if ((opcode >= OpCode.PUSH1 && opcode <= OpCode.PUSH16) || (opcode == OpCode.PUSH0))
		{
			entry.int = opcode && (opcode - OpCode.PUSH1 + 1)
			entry.data = Buffer.from([entry.int])
		}
		else
		switch (opcode)
		{
			// Push value
			//case OpCode.PUSH0:

			case OpCode.PUSHDATA1:
				{
					let len = readByte()
					entry.data = readBytes(len)
					entry.comment = "Pushes " + len + " bytes into the stack: $$"
					break
				}

			case OpCode.PUSHDATA2:
				{
					let len = readUInt16()
					entry.data = readBytes(len)
					entry.comment = "Pushes " + len + " bytes into the stack: $$"
					break
				}


			case OpCode.PUSHDATA4:
				{
					let len = readInt32()
					entry.data = readBytes(len)
					entry.comment = "Pushes " + len + " bytes into the stack: $$"
					break
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
					let offset = readInt16()
					//offset = context.InstructionPointer + offset - 3
					break
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
					let script_hash = readBytes(20)
					entry.data = script_hash
					entry.comment = "Calls script with hash: $XX"
					break
				}

			case OpCode.SYSCALL:
				{
					entry.data = readBytes(252)
					entry.comment = "System call with data: $$"
					break
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
					if (!OpCode[opcode])
					{
						entry.name = "???"
						entry.comment = "Invalid opcode!!"
					}

					break
				}
		}
		entry.hex = entry.data && entry.data.toString('hex')

		entries.push(entry)
	}
	return entries
}

export enum OpCode
{
	// Constants
	PUSH0 = 0x00, // An empty array of bytes is pushed onto the stack.
	PUSHF = PUSH0,
	PUSHBYTES1 = 0x01, // 0x01-0x4B The next opcode bytes is data to be pushed onto the stack
	PUSHBYTES75 = 0x4B,
	PUSHDATA1 = 0x4C, // The next byte contains the number of bytes to be pushed onto the stack.
	PUSHDATA2 = 0x4D, // The next two bytes contain the number of bytes to be pushed onto the stack.
	PUSHDATA4 = 0x4E, // The next four bytes contain the number of bytes to be pushed onto the stack.
	PUSHM1 = 0x4F, // The number -1 is pushed onto the stack.
	PUSH1 = 0x51, // The number 1 is pushed onto the stack.
	PUSHT = PUSH1,
	PUSH2 = 0x52, // The number 2 is pushed onto the stack.
	PUSH3 = 0x53, // The number 3 is pushed onto the stack.
	PUSH4 = 0x54, // The number 4 is pushed onto the stack.
	PUSH5 = 0x55, // The number 5 is pushed onto the stack.
	PUSH6 = 0x56, // The number 6 is pushed onto the stack.
	PUSH7 = 0x57, // The number 7 is pushed onto the stack.
	PUSH8 = 0x58, // The number 8 is pushed onto the stack.
	PUSH9 = 0x59, // The number 9 is pushed onto the stack.
	PUSH10 = 0x5A, // The number 10 is pushed onto the stack.
	PUSH11 = 0x5B, // The number 11 is pushed onto the stack.
	PUSH12 = 0x5C, // The number 12 is pushed onto the stack.
	PUSH13 = 0x5D, // The number 13 is pushed onto the stack.
	PUSH14 = 0x5E, // The number 14 is pushed onto the stack.
	PUSH15 = 0x5F, // The number 15 is pushed onto the stack.
	PUSH16 = 0x60, // The number 16 is pushed onto the stack.


	// Flow control
	NOP = 0x61, // Does nothing.
	JMP = 0x62,
	JMPIF = 0x63,
	JMPIFNOT = 0x64,
	CALL = 0x65,
	RET = 0x66,
	APPCALL = 0x67,
	SYSCALL = 0x68,
	TAILCALL = 0x69,


	// Stack
	DUPFROMALTSTACK = 0x6A,
	TOALTSTACK = 0x6B, // Puts the input onto the top of the alt stack. Removes it from the main stack.
	FROMALTSTACK = 0x6C, // Puts the input onto the top of the main stack. Removes it from the alt stack.
	XDROP = 0x6D,
	XSWAP = 0x72,
	XTUCK = 0x73,
	DEPTH = 0x74, // Puts the number of stack items onto the stack.
	DROP = 0x75, // Removes the top stack item.
	DUP = 0x76, // Duplicates the top stack item.
	NIP = 0x77, // Removes the second-to-top stack item.
	OVER = 0x78, // Copies the second-to-top stack item to the top.
	PICK = 0x79, // The item n back in the stack is copied to the top.
	ROLL = 0x7A, // The item n back in the stack is moved to the top.
	ROT = 0x7B, // The top three items on the stack are rotated to the left.
	SWAP = 0x7C, // The top two items on the stack are swapped.
	TUCK = 0x7D, // The item at the top of the stack is copied and inserted before the second-to-top item.


	// Splice
	CAT = 0x7E, // Concatenates two strings.
	SUBSTR = 0x7F, // Returns a section of a string.
	LEFT = 0x80, // Keeps only characters left of the specified point in a string.
	RIGHT = 0x81, // Keeps only characters right of the specified point in a string.
	SIZE = 0x82, // Returns the length of the input string.


	// Bitwise logic
	INVERT = 0x83, // Flips all of the bits in the input.
	AND = 0x84, // Boolean and between each bit in the inputs.
	OR = 0x85, // Boolean or between each bit in the inputs.
	XOR = 0x86, // Boolean exclusive or between each bit in the inputs.
	EQUAL = 0x87, // Returns 1 if the inputs are exactly equal, 0 otherwise.
	//OP_EQUALVERIFY = 0x88, // Same as OP_EQUAL, but runs OP_VERIFY afterward.
	//OP_RESERVED1 = 0x89, // Transaction is invalid unless occuring in an unexecuted OP_IF branch
	//OP_RESERVED2 = 0x8A, // Transaction is invalid unless occuring in an unexecuted OP_IF branch


	// Arithmetic
	// Note: Arithmetic inputs are limited to signed 32-bit integers, but may overflow their output.
	INC = 0x8B, // 1 is added to the input.
	DEC = 0x8C, // 1 is subtracted from the input.
	SIGN = 0x8D,
	NEGATE = 0x8F, // The sign of the input is flipped.
	ABS = 0x90, // The input is made positive.
	NOT = 0x91, // If the input is 0 or 1, it is flipped. Otherwise the output will be 0.
	NZ = 0x92, // Returns 0 if the input is 0. 1 otherwise.
	ADD = 0x93, // a is added to b.
	SUB = 0x94, // b is subtracted from a.
	MUL = 0x95, // a is multiplied by b.
	DIV = 0x96, // a is divided by b.
	MOD = 0x97, // Returns the remainder after dividing a by b.
	SHL = 0x98, // Shifts a left b bits, preserving sign.
	SHR = 0x99, // Shifts a right b bits, preserving sign.
	BOOLAND = 0x9A, // If both a and b are not 0, the output is 1. Otherwise 0.
	BOOLOR = 0x9B, // If a or b is not 0, the output is 1. Otherwise 0.
	NUMEQUAL = 0x9C, // Returns 1 if the numbers are equal, 0 otherwise.
	NUMNOTEQUAL = 0x9E, // Returns 1 if the numbers are not equal, 0 otherwise.
	LT = 0x9F, // Returns 1 if a is less than b, 0 otherwise.
	GT = 0xA0, // Returns 1 if a is greater than b, 0 otherwise.
	LTE = 0xA1, // Returns 1 if a is less than or equal to b, 0 otherwise.
	GTE = 0xA2, // Returns 1 if a is greater than or equal to b, 0 otherwise.
	MIN = 0xA3, // Returns the smaller of a and b.
	MAX = 0xA4, // Returns the larger of a and b.
	WITHIN = 0xA5, // Returns 1 if x is within the specified range (left-inclusive), 0 otherwise.


	// Crypto
	//RIPEMD160 = 0xA6, // The input is hashed using RIPEMD-160.
	SHA1 = 0xA7, // The input is hashed using SHA-1.
	SHA256 = 0xA8, // The input is hashed using SHA-256.
	HASH160 = 0xA9,
	HASH256 = 0xAA,
	CHECKSIG = 0xAC,
	CHECKMULTISIG = 0xAE,


	// Array
	ARRAYSIZE = 0xC0,
	PACK = 0xC1,
	UNPACK = 0xC2,
	PICKITEM = 0xC3,
	SETITEM = 0xC4,
	NEWARRAY = 0xC5, //用作引用類型
	NEWSTRUCT = 0xC6, //用作值類型


	// Exceptions
	THROW = 0xF0,
	THROWIFNOT = 0xF1
}
export let hints: { [key: number]: string } = {}
 // Constants
 hints[OpCode.PUSH0] = "An empty array of bytes is pushed onto the stack.";
 hints[OpCode.PUSHF] = hints[OpCode.PUSH0];
 hints[OpCode.PUSHBYTES1] = /*0x01-0x4B*/ "The next opcode bytes is data to be pushed onto the stack";
 hints[OpCode.PUSHBYTES75] = "";
 hints[OpCode.PUSHDATA1] = "The next byte contains the number of bytes to be pushed onto the stack.";
 hints[OpCode.PUSHDATA2] = "The next two bytes contain the number of bytes to be pushed onto the stack.";
 hints[OpCode.PUSHDATA4] = "The next four bytes contain the number of bytes to be pushed onto the stack.";
 hints[OpCode.PUSHM1] = "The number -1 is pushed onto the stack.";
 hints[OpCode.PUSH1] = "The number 1 is pushed onto the stack.";
 hints[OpCode.PUSHT] = hints[OpCode.PUSH1];
 hints[OpCode.PUSH2] = "The number 2 is pushed onto the stack.";
 hints[OpCode.PUSH3] = "The number 3 is pushed onto the stack.";
 hints[OpCode.PUSH4] = "The number 4 is pushed onto the stack.";
 hints[OpCode.PUSH5] = "The number 5 is pushed onto the stack.";
 hints[OpCode.PUSH6] = "The number 6 is pushed onto the stack.";
 hints[OpCode.PUSH7] = "The number 7 is pushed onto the stack.";
 hints[OpCode.PUSH8] = "The number 8 is pushed onto the stack.";
 hints[OpCode.PUSH9] = "The number 9 is pushed onto the stack.";
 hints[OpCode.PUSH10] = "The number 10 is pushed onto the stack.";
 hints[OpCode.PUSH11] = "The number 11 is pushed onto the stack.";
 hints[OpCode.PUSH12] = "The number 12 is pushed onto the stack.";
 hints[OpCode.PUSH13] = "The number 13 is pushed onto the stack.";
 hints[OpCode.PUSH14] = "The number 14 is pushed onto the stack.";
 hints[OpCode.PUSH15] = "The number 15 is pushed onto the stack.";
 hints[OpCode.PUSH16] = "The number 16 is pushed onto the stack.";


 // Flow control
 hints[OpCode.NOP] = "Does nothing.";
 hints[OpCode.JMP] = "";
 hints[OpCode.JMPIF] = "";
 hints[OpCode.JMPIFNOT] = "";
 hints[OpCode.CALL] = "";
 hints[OpCode.RET] = "";
 hints[OpCode.APPCALL] = "";
 hints[OpCode.SYSCALL] = "";
 hints[OpCode.TAILCALL] = "";


 // Stack
 hints[OpCode.DUPFROMALTSTACK] = "";
 hints[OpCode.TOALTSTACK] = "Puts the input onto the top of the alt stack. Removes it from the main stack.";
 hints[OpCode.FROMALTSTACK] = "Puts the input onto the top of the main stack. Removes it from the alt stack.";
 hints[OpCode.XDROP] = "";
 hints[OpCode.XSWAP] = "";
 hints[OpCode.XTUCK] = "";
 hints[OpCode.DEPTH] = "Puts the number of stack items onto the stack.";
 hints[OpCode.DROP] = "Removes the top stack item.";
 hints[OpCode.DUP] = "Duplicates the top stack item.";
 hints[OpCode.NIP] = "Removes the second-to-top stack item.";
 hints[OpCode.OVER] = "Copies the second-to-top stack item to the top.";
 hints[OpCode.PICK] = "The item in back in the stack is copied to the top.";
 hints[OpCode.ROLL] = "The item in back in the stack is moved to the top.";
 hints[OpCode.ROT] = "The top three items on the stack are rotated to the left.";
 hints[OpCode.SWAP] = "The top two items on the stack are swapped.";
 hints[OpCode.TUCK] = "The item at the top of the stack is copied and inserted before the second-to-top item.";


 // Splice
 hints[OpCode.CAT] = "Concatenates two strings.";
 hints[OpCode.SUBSTR] = "Returns a section of a string.";
 hints[OpCode.LEFT] = "Keeps only characters left of the specified point in a string.";
 hints[OpCode.RIGHT] = "Keeps only characters right of the specified point in a string.";
 hints[OpCode.SIZE] = "Returns the length of the input string.";


 // Bitwise logic
 hints[OpCode.INVERT] = "Flips all of the bits in the input.";
 hints[OpCode.AND] = "Boolean and between each bit in the inputs.";
 hints[OpCode.OR] = "Boolean or between each bit in the inputs.";
 hints[OpCode.XOR] = "Boolean exclusive or between each bit in the inputs.";
 hints[OpCode.EQUAL] = "Returns 1 if the inputs are exactly equal, 0 otherwise.";
 //OP_EQUALVERIFY = 0x88, // Same as OP_EQUAL, but runs OP_VERIFY afterward.
 //OP_RESERVED1 = 0x89, // Transaction is invalid unless occuring in an unexecuted OP_IF branch
 //OP_RESERVED2 = 0x8A, // Transaction is invalid unless occuring in an unexecuted OP_IF branch


 // Arithmetic
 // Note: Arithmetic inputs are limited to signed 32-bit integers, but may overflow their output.
 hints[OpCode.INC] = "1 is added to the input.";
 hints[OpCode.DEC] = "1 is subtracted from the input.";
 hints[OpCode.SIGN] = "";
 hints[OpCode.NEGATE] = "The sign of the input is flipped.";
 hints[OpCode.ABS] = "The input is made positive.";
 hints[OpCode.NOT] = "If the input is 0 or 1, it is flipped. Otherwise the output will be 0.";
 hints[OpCode.NZ] = "Returns 0 if the input is 0. 1 otherwise.";
 hints[OpCode.ADD] = "a is added to b.";
 hints[OpCode.SUB] = "b is subtracted from a.";
 hints[OpCode.MUL] = "a is multiplied by b.";
 hints[OpCode.DIV] = "a is divided by b.";
 hints[OpCode.MOD] = "Returns the remainder after dividing a by b.";
 hints[OpCode.SHL] = "Shifts a left b bits, preserving sign.";
 hints[OpCode.SHR] = "Shifts a right b bits, preserving sign.";
 hints[OpCode.BOOLAND] = "If both a and b are not 0, the output is 1. Otherwise 0.";
 hints[OpCode.BOOLOR] = "If a or b is not 0, the output is 1. Otherwise 0.";
 hints[OpCode.NUMEQUAL] = "Returns 1 if the numbers are equal, 0 otherwise.";
 hints[OpCode.NUMNOTEQUAL] = "Returns 1 if the numbers are not equal, 0 otherwise.";
 hints[OpCode.LT] = "Returns 1 if a is less than b, 0 otherwise.";
 hints[OpCode.GT] = "Returns 1 if a is greater than b, 0 otherwise.";
 hints[OpCode.LTE] = "Returns 1 if a is less than or equal to b, 0 otherwise.";
 hints[OpCode.GTE] = "Returns 1 if a is greater than or equal to b, 0 otherwise.";
 hints[OpCode.MIN] = "Returns the smaller of a and b.";
 hints[OpCode.MAX] = "Returns the larger of a and b.";
 hints[OpCode.WITHIN] = "Returns 1 if x is within the specified range (left-inclusive), 0 otherwise.";


 // Crypto
 //hints[OpCode.RIPEMD160 = 0xA6, // The input is hashed using RIPEMD-160.
 hints[OpCode.SHA1] = ""; // The input is hashed using SHA-1.
 hints[OpCode.SHA256] = ""; // The input is hashed using SHA-256.
 hints[OpCode.HASH160] = "";
 hints[OpCode.HASH256] = "";
 hints[OpCode.CHECKSIG] = "";
 hints[OpCode.CHECKMULTISIG] = "";


 // Array
 hints[OpCode.ARRAYSIZE] = "ARRAYSIZE";
 hints[OpCode.PACK] = "PACK";
 hints[OpCode.UNPACK] = "UNPACK";
 hints[OpCode.PICKITEM] = "Pops index and array from stack, then push the item in the array index to the stack";
 hints[OpCode.SETITEM] = "Pops newItem, index and array from stack, then copy the newItem to the array value at index";
 hints[OpCode.NEWARRAY] = "Pops size from stack and creates a new array with that size, and pushes the array into the stack";
 hints [ OpCode . NEWSTRUCT ] =  " as value type " ;


 // Exceptions
 hints[OpCode.THROW] = "";
 hints[OpCode.THROWIFNOT] = "";