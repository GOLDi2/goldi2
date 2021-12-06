'use strict';

import IRichLanguageConfiguration = monaco.languages.LanguageConfiguration;
import ILanguage = monaco.languages.IMonarchLanguage;

export const conf: IRichLanguageConfiguration = {
	comments: {
		lineComment: '--'
	},
	brackets: [
		['{', '}'], ['[', ']'], ['(', ')'], ['<', '>'],
		['component', 'end component'],
		['entity', 'end entity'],
		['process', 'end process'],
		['if', 'end if'],
		['case', 'end case'],
		['architecture', 'end architecture'],
		['record', 'record'],
		['block', 'end block'],
		['loop', 'end loop'],
		['function', 'end function'],
		['generate', 'end generate'],
		['package', 'end package']
	],
	autoClosingPairs: [
		{ open: '{', close: '}', notIn: ['string', 'comment'] },
		{ open: '[', close: ']', notIn: ['string', 'comment'] },
		{ open: '(', close: ')', notIn: ['string', 'comment'] },
		{ open: '"', close: '"', notIn: ['string', 'comment'] },
		{ open: '<', close: '>', notIn: ['string', 'comment'] },
	],
	folding: {
		markers: {
			start: new RegExp("^\\s*#region\\b"),
			end: new RegExp("^\\s*#endregion\\b")
		}
	}
};

export const language = < ILanguage > {
	defaultToken: '',
	tokenPostfix: '.vhdl',
	ignoreCase: true,

	brackets: [
		{ token: 'delimiter.bracket', open: '{', close: '}' },
		{ token: 'delimiter.array', open: '[', close: ']' },
		{ token: 'delimiter.parenthesis', open: '(', close: ')' },
		{ token: 'delimiter.angle', open: '<', close: '>' },

		{ token: 'keyword.tag-component', open: 'component', close: 'end component' },
		{ token: 'keyword.tag-entity', open: 'entity', close: 'end entity' },
		{ token: 'keyword.tag-process', open: 'process', close: 'end process' },
		{ token: 'keyword.tag-function', open: 'function', close: 'end function' },
		{ token: 'keyword.tag-case', open: 'case', close: 'end case' },
		{ token: 'keyword.tag-if', open: 'if', close: 'end if' },
		{ token: 'keyword.tag-architecture', open: 'architecture', close: 'end architecture' },
		{ token: 'keyword.tag-record', open: 'record', close: 'end record' },
		{ token: 'keyword.tag-block', open: 'block', close: 'end block' },
		{ token: 'keyword.tag-loop', open: 'loop', close: 'end loop' },
		{ token: 'keyword.tag-generate', open: 'generate', close: 'end generate' },
		{ token: 'keyword.tag-package', open: 'package', close: 'end package' },
	],
	keywords: [
		'access', 'after', 'alias', 'all', 'array', 'assert', 'attribute', 'begin', 'body',
		'buffer', 'bus', 'configuration', 'constant', 'disconnect', 'downto', 'else', 'elsif',
		'end', 'exit', 'file', 'for', 'generic', 'group', 'guarded', 'impure', 'in', 'inertial',
		'inout', 'is', 'label', 'library', 'linkage', 'literal', 'loop', 'map', 'new', 'next', 'null',
		'of', 'on', 'open', 'others', 'out', 'port', 'postponed', 'procedure', 'pure', 'range',
		'register', 'reject', 'report', 'return', 'select', 'severity', 'shared', 'signal', 'subtype',
		'then', 'to', 'transport', 'type', 'unaffected', 'units', 'until', 'use', 'variable', 'wait',
		'when', 'while', 'with', 'assume', 'assume_guarantee', 'context', 'cover', 'default', 'fairness',
		'force', 'parameter', 'property', 'protected', 'release', 'restrict', 'restrict_guarantee',
		'sequence', 'strong', 'vmode', 'vprop', 'vunit', 'abs', 'and', 'mod', 'nand', 'nor', 'not', 'or',
		'rem', 'rol', 'ror', 'sla', 'sll', 'sra', 'srl', 'xnor', 'xor'
	],
	tagwords: [
		'component', 'entity', 'process', 'function', 'case', 'if', 'architecture', 'record', 'block',
		'generate', 'package'
	],
	typeKeywords: [
		'boolean', 'bit', 'character', 'severity_level', 'integer', 'real', 'time', 'delay_length', 'natural', 'positive',
		'string', 'bit_vector', 'file_open_kind', 'file_open_status', 'line', 'text', 'side', 'width', 'std_ulogic',
		'std_ulogic_vector', 'std_logic', 'std_logic_vector', 'X01', 'X01Z', 'UX01', 'UX01Z', 'unsigned', 'signed'
	],
	operators: [
		'<=', '=>', '<', '>', '|', '+', ':=', '-', '=', '/=', '**', '*', '/', '&'
	],
	// we include these common regular expressions
	symbols: /[=><!~?:&|+\-*\/\^%]+/,
	escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
	digits: /\d+(_+\d+)*/,
	octaldigits: /[0-7]+(_+[0-7]+)*/,
	binarydigits: /[0-1]+(_+[0-1]+)*/,
	hexdigits: /[[0-9a-fA-F]+(_+[0-9a-fA-F]+)*/,
	// The main tokenizer for our languages
	tokenizer: {
		root: [
			// usual ending tags
			[/end\s+(?!for|do)([a-zA-Z_]\w*)/, { token: 'keyword.tag-$1' }],

			// identifiers, tagwords, and keywords
			[/[a-zA-Z_$][\w$]*/, {
				cases: {
					'@tagwords': { token: 'keyword.tag-$0' },
					'@keywords': { token: 'keyword.$0' },
					'@default': 'identifier'
				}
			}],
			// whitespace
			{ include: '@whitespace' },
			// delimiters and operators
			[/[{}()\[\]]/, '@brackets'],
			[/[<>](?!@symbols)/, '@brackets'],
			[/@symbols/, {
				cases: {
					'@operators': 'delimiter',
					'@default': ''
				}
			}],
			// @ annotations.
			[/@\s*[a-zA-Z_\$][\w\$]*/, 'annotation'],
			// numbers
			[/(@digits)[eE]([\-+]?(@digits))?[fFdD]?/, 'number.float'],
			[/(@digits)\.(@digits)([eE][\-+]?(@digits))?[fFdD]?/, 'number.float'],
			[/0[xX](@hexdigits)[Ll]?/, 'number.hex'],
			[/0(@octaldigits)[Ll]?/, 'number.octal'],
			[/0[bB](@binarydigits)[Ll]?/, 'number.binary'],
			[/(@digits)[fFdD]/, 'number.float'],
			[/(@digits)[lL]?/, 'number'],
			// delimiter: after number because of .\d floats
			[/[;,.]/, 'delimiter'],
			// strings
			{include: 'common'}

		],

		common: [
			// strings
			[/"([^"\\]|\\.)*$/, 'string.invalid'],  // non-teminated string
			[/'([^'\\]|\\.)*$/, 'string.invalid'],  // non-teminated string
			[/"/, 'string', '@string_double'],
			[/'/, 'string', '@string_single']
		],

		whitespace: [
			[/[ \t\r,]+/, ''],
			[/\-\-.*$/, 'comment'],
		],

		comment: [
			[/[^\--]+/, 'comment']
			//[/\*\//, 'comment', '@pop'],
			//[/[\/*]/, 'comment']
		],

		string_double: [
			[/[^\\"]+/, 'string'],
			[/@escapes/, 'string.escape'],
			[/\\./, 'string.escape.invalid'],
			[/"/, 'string', '@pop']
		],

		string_single: [
			[/[^\\']+/, 'string'],
			[/@escapes/, 'string.escape'],
			[/\\./, 'string.escape.invalid'],
			[/'/, 'string', '@pop']
		]
	},
};
