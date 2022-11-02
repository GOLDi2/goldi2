'use strict';

import { testTokenization } from "../test/testRunner";

testTokenization('logic', [
	// hier die Testfälle beginnen
	[{
		line: '//',
		tokens: [
			{ startIndex: 0, type: 'comment.logic' }
		]
	}],
	[{
		line: '    // a comment',
		tokens: [
			{ startIndex: 0, type: '' },
			{ startIndex: 4, type: 'comment.logic' }
		]
	}],
	[{
		line :'0',
		tokens:[
			{startIndex:0,type:'number.logic'},
		]


	}],

	[{
		line: '0+0',
		tokens: [
			{ startIndex: 0, type: 'number.logic' },
			{ startIndex: 1, type: 'operator.logic' },
			{ startIndex: 2, type: 'number.logic' }
		]
	}],

	[{
		line: '100+10',
		tokens: [
			{ startIndex: 0, type: 'number.logic' },
			{ startIndex: 3, type: 'operator.logic' },
			{ startIndex: 4, type: 'number.logic' }
		]
	}],

	]);






