'use strict';

import { testTokenization } from "../test/testRunner";

testTokenization('vhdl', [
	// Comments

	[{line: '-- a comment',
		tokens:[
			{startIndex: 0, type:'comment.vhdl'}
		]

			}],
	//Keywords

	// Numbers
	[{
	line :'0',
		tokens:[
			{startIndex:0,type:'number.vhdl'},
		]


	}],
	[{
		line: '0.10',
		tokens: [
			{ startIndex: 0, type: 'number.float.vhdl' }
		]
	}],

	[{
		line: '0x',
		tokens: [
			{ startIndex: 0, type: 'number.vhdl' },
			{ startIndex: 1, type: 'identifier.vhdl' }
		]
	}],

	[{
		line: '0x123',
		tokens: [
			{ startIndex: 0, type: 'number.hex.vhdl' }
		]
	}],

	[{
		line: '0x5_2',
		tokens: [
			{ startIndex: 0, type: 'number.hex.vhdl' }
		]
	}],

	[{
		line: '023L',
		tokens: [
			{ startIndex: 0, type: 'number.octal.vhdl' }
		]
	}],

	[{
		line: '0123l',
		tokens: [
			{ startIndex: 0, type: 'number.octal.vhdl' }
		]
	}],

	[{
		line: '05_2',
		tokens: [
			{ startIndex: 0, type: 'number.octal.vhdl' }
		]
	}],

	[{
		line: '0b1010_0101',
		tokens: [
			{ startIndex: 0, type: 'number.binary.vhdl' }
		]
	}],

	[{
		line: '0B001',
		tokens: [
			{ startIndex: 0, type: 'number.binary.vhdl' }
		]
	}],

	[{
		line: '10e3',
		tokens: [
			{ startIndex: 0, type: 'number.float.vhdl' }
		]
	}],

	[{
		line: '10f',
		tokens: [
			{ startIndex: 0, type: 'number.float.vhdl' }
		]
	}],

	[{
		line: '23.5',
		tokens: [
			{ startIndex: 0, type: 'number.float.vhdl' }
		]
	}],

	[{
		line: '23.5e3',
		tokens: [
			{ startIndex: 0, type: 'number.float.vhdl' }
		]
	}],

	[{
		line: '23.5e-3',
		tokens: [
			{ startIndex: 0, type: 'number.float.vhdl' }
		]
	}],

	[{
		line: '23.5E3',
		tokens: [
			{ startIndex: 0, type: 'number.float.vhdl' }
		]
	}],

	[{
		line: '23.5E-3',
		tokens: [
			{ startIndex: 0, type: 'number.float.vhdl' }
		]
	}],

	[{
		line: '23.5F',
		tokens: [
			{ startIndex: 0, type: 'number.float.vhdl' }
		]
	}],

	[{
		line: '23.5f',
		tokens: [
			{ startIndex: 0, type: 'number.float.vhdl' }
		]
	}],

	[{
		line: '23.5D',
		tokens: [
			{ startIndex: 0, type: 'number.float.vhdl' }
		]
	}],

	[{
		line: '23.5d',
		tokens: [
			{ startIndex: 0, type: 'number.float.vhdl' }
		]
	}],

	[{
		line: '1.72E3D',
		tokens: [
			{ startIndex: 0, type: 'number.float.vhdl' }
		]
	}],

	[{
		line: '1.72E3d',
		tokens: [
			{ startIndex: 0, type: 'number.float.vhdl' }
		]
	}],

	[{
		line: '1.72E-3d',
		tokens: [
			{ startIndex: 0, type: 'number.float.vhdl' }
		]
	}],

	[{
		line: '1.72e3D',
		tokens: [
			{ startIndex: 0, type: 'number.float.vhdl' }
		]
	}],

	[{
		line: '1.72e3d',
		tokens: [
			{ startIndex: 0, type: 'number.float.vhdl' }
		]
	}],

	[{
		line: '1.72e-3d',
		tokens: [
			{ startIndex: 0, type: 'number.float.vhdl' }
		]
	}],

	[{
		line: '23L',
		tokens: [
			{ startIndex: 0, type: 'number.vhdl' }
		]
	}],

	[{
		line: '23l',
		tokens: [
			{ startIndex: 0, type: 'number.vhdl' }
		]
	}],

	[{
		line: '0_52',
		tokens: [
			{ startIndex: 0, type: 'number.vhdl' }
		]
	}],

	[{
		line: '5_2',
		tokens: [
			{ startIndex: 0, type: 'number.vhdl' }
		]
	}],

	[{
		line: '5_______2',
		tokens: [
			{ startIndex: 0, type: 'number.vhdl' }
		]
	}],

	[{
		line: '3_.1415F',
		tokens: [
			{ startIndex: 0, type: 'number.vhdl' },
			{ startIndex: 1, type: 'identifier.vhdl' },
			{ startIndex: 2, type: 'delimiter.vhdl' },
			{ startIndex: 3, type: 'number.float.vhdl' }
		]
	}],

	[{
		line: '3._1415F',
		tokens: [
			{ startIndex: 0, type: 'number.vhdl' },
			{ startIndex: 1, type: 'delimiter.vhdl' },
			{ startIndex: 2, type: 'identifier.vhdl' }
		]
	}],

	[{
		line: '999_99_9999_L',
		tokens: [
			{ startIndex: 0, type: 'number.vhdl' },
			{ startIndex: 11, type: 'identifier.vhdl' }
		]
	}],

	[{
		line: '52_',
		tokens: [
			{ startIndex: 0, type: 'number.vhdl' },
			{ startIndex: 2, type: 'identifier.vhdl' }
		]
	}],

	[{
		line: '0_x52',
		tokens: [
			{ startIndex: 0, type: 'number.vhdl' },
			{ startIndex: 1, type: 'identifier.vhdl' }
		]
	}],

	[{
		line: '0x_52',
		tokens: [
			{ startIndex: 0, type: 'number.vhdl' },
			{ startIndex: 1, type: 'identifier.vhdl' }
		]
	}],

	[{
		line: '0x52_',
		tokens: [
			{ startIndex: 0, type: 'number.hex.vhdl' },
			{ startIndex: 4, type: 'identifier.vhdl' }
		]
	}],

	[{
		line: '052_',
		tokens: [
			{ startIndex: 0, type: 'number.octal.vhdl' },
			{ startIndex: 3, type: 'identifier.vhdl' }
		]
	}],

	[{
		line: '23.5L',
		tokens: [
			{ startIndex: 0, type: 'number.float.vhdl' },
			{ startIndex: 4, type: 'identifier.vhdl' }
		]
	}],

	[{
		line: '0+0',
		tokens: [
			{ startIndex: 0, type: 'number.vhdl' },
			{ startIndex: 1, type: 'delimiter.vhdl' },
			{ startIndex: 2, type: 'number.vhdl' }
		]
	}],

	[{
		line: '100+10',
		tokens: [
			{ startIndex: 0, type: 'number.vhdl' },
			{ startIndex: 3, type: 'delimiter.vhdl' },
			{ startIndex: 4, type: 'number.vhdl' }
		]
	}],

	[{
		line: 'library IEEE entity COUNT16 is port(); end entity',
			tokens: [
				{ startIndex: 0, type: 'keyword.library.vhdl' },
				{ startIndex: 7, type: '' },
				{ startIndex: 8, type: 'identifier.vhdl' },
				{ startIndex: 12, type: '' },
				{ startIndex: 13, type: 'keyword.tag-entity.vhdl' },
				{ startIndex: 19, type: '' },
				{ startIndex: 20, type: 'identifier.vhdl' },
				{ startIndex: 27, type: '' },
				{ startIndex: 28, type: 'keyword.is.vhdl' },
				{ startIndex: 30, type: '' },
				{ startIndex: 31, type: 'keyword.port.vhdl' },
				{ startIndex: 35, type: 'delimiter.parenthesis.vhdl' }, //Klammern als Paare betrachten
				{ startIndex: 37, type: 'delimiter.vhdl' },
				{ startIndex: 38, type: '' },
				{ startIndex: 39, type: 'keyword.tag-entity.vhdl' }
			]
	}],

	//String and Keywords
	[{
		line:'n: process(a,b) begin if (a=\'1\') and (b=\'1\') end if;end;',
		tokens:[
			{ startIndex: 0, type: 'identifier.vhdl' },
			{ startIndex: 1, type: '' },
			{ startIndex: 3, type: 'keyword.tag-process.vhdl' },
			{ startIndex: 10, type: 'delimiter.parenthesis.vhdl' },
			{ startIndex: 11, type: 'identifier.vhdl' },
			{ startIndex: 12, type: '' },
			{ startIndex: 13, type: 'identifier.vhdl' },
			{ startIndex: 14, type: 'delimiter.parenthesis.vhdl' },
			{ startIndex: 15, type: '' },
			{ startIndex: 16, type: 'keyword.begin.vhdl' },
			{ startIndex: 21, type: '' },
			{ startIndex: 22, type: 'keyword.tag-if.vhdl' },
			{ startIndex: 24, type: '' },
			{ startIndex: 25, type: 'delimiter.parenthesis.vhdl' },
			{ startIndex: 26, type: 'identifier.vhdl' },
			{ startIndex: 27, type: 'delimiter.vhdl' },
			{ startIndex: 28, type: 'string.vhdl' },
			{ startIndex: 31, type: 'delimiter.parenthesis.vhdl' } ,
			{ startIndex: 32, type: '' },
			{ startIndex: 33, type: 'keyword.and.vhdl' },
			{ startIndex: 36, type: '' },
			{ startIndex: 37, type: 'delimiter.parenthesis.vhdl' },
			{ startIndex: 38, type: 'identifier.vhdl' },
			{ startIndex: 39, type: 'delimiter.vhdl' },
			{ startIndex: 40, type: 'string.vhdl' },
			{ startIndex: 43, type: 'delimiter.parenthesis.vhdl'},
			{ startIndex: 44, type: '' },
			{ startIndex: 45, type: 'keyword.tag-if.vhdl' },
			{ startIndex: 51, type: 'delimiter.vhdl' },
			{ startIndex: 52, type: 'keyword.end.vhdl' },
			{ startIndex: 55, type: 'delimiter.vhdl' }
	]
}]

]);
