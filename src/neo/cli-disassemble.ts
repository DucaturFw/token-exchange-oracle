import { disassemble } from "./neo-disassemble"

_start_()
function _start_()
{
	let [_1, _2, script] = process.argv
	if (!script)
		return console.log(`NEO Disassemble\nUsage: yarn neo-disassemble <script>`)
	
	console.log(disassemble(script))
}