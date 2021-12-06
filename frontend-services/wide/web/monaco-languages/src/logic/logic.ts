'use strict';

import IRichLanguageConfiguration = monaco.languages.LanguageConfiguration;
import ILanguage = monaco.languages.IMonarchLanguage;

export const conf: IRichLanguageConfiguration = {
	comments: {
		lineComment: '//'
	},
	brackets: [
		['(', ')'],
	],
	autoClosingPairs: [
		{ open: '(', close: ')' },
	],
	surroundingPairs: [
		{ open: '(', close: ')' },
	],
	//folding: {
	//	markers: {
	//		start: new RegExp("^\\s*//\\s*(?:(?:#?region\\b)|(?:<editor-fold\\b))"),
	//		end: new RegExp("^\\s*//\\s*(?:(?:#?endregion\\b)|(?:</editor-fold>))")
	//	}
	//}
};

export const language = < ILanguage > {
	defaultToken: '',
	tokenPostfix: '.logic',

	keywords: [ 'input', 'output' ],
	operators: [ ':=', '\/', '&', '+', '=', ';' ],

	// we include these common regular expressions
	symbols: /[=><!~?:&|+\-*\/\^%;]+/,
	// C# style strings
	//escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
	// Zahlen
	digits: /\d+(_+\d+)*/,
	octaldigits: /[0-7]+(_+[0-7]+)*/,
	binarydigits: /[0-1]+(_+[0-1]+)*/,
	hexdigits: /[[0-9a-fA-F]+(_+[0-9a-fA-F]+)*/,
	// The main tokenizer for our languages
	tokenizer: {
		root: [
			// identifiers and keywords
			[/[a-z_$][\w$]*/, {
				cases: {
					'@keywords': 'keyword',
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
					'@operators': 'operator',
					'@default': ''
				}
			}],
			// @ annotations.
			// As an example, we emit a debugging log message on these tokens.
			// Note: message are supressed during the first load -- change some lines to see them.
			[/@\s*[a-zA-Z_\$][\w\$]*/, {
				token: 'annotation',
				log: 'annotation token: $0'
			}],
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
			/*[/"([^"\\]|\\.)*$/, 'string.invalid'], // non-teminated string
			[/"/, {
				token: 'string.quote',
				bracket: '@open',
				next: '@string'
			}],
			// characters
			[/'[^\\']'/, 'string'],
			[/(')(@escapes)(')/, ['string', 'string.escape', 'string']],
			[/'/, 'string.invalid']*/
		],

		/*string: [
			[/[^\\"]+/, 'string'],
			[/@escapes/, 'string.escape'],
			[/\\./, 'string.escape.invalid'],
			[/"/, {
				token: 'string.quote',
				bracket: '@close',
				next: '@pop'
			}]
		],*/
		whitespace: [
			[/[ \t\r\n]+/, ''],
			[/\/\/.*$/, 'comment'],
		],
	},
};
