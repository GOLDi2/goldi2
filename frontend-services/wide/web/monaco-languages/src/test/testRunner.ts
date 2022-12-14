/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import '../monaco.contribution';
import {loadLanguage} from '../_.contribution';
import * as assert from 'assert';

// Allow for running under nodejs/requirejs in tests
const _monaco: typeof monaco = (typeof monaco === 'undefined' ? (<any>self).monaco : monaco);

export interface IRelaxedToken {
	startIndex: number;
	type: string;
}

export interface ITestItem {
	line: string;
	tokens: IRelaxedToken[];
}

export function testTokenization(_language:string|string[], tests:ITestItem[][]): void {
	let languages:string[];
	if (typeof _language === 'string') {
		languages = [_language];
	} else {
		languages = _language;
	}
	let mainLanguage = languages[0];
	suite(mainLanguage + ' tokenization', () => {
		test('', (done) => {
			Promise.all(languages.map(l => loadLanguage(l))).then(() => {
				// clean stack
				setTimeout(() => {
					runTests(mainLanguage, tests);
					done();
				});
			}).then(null, done);
		});
	});
}

function runTests(languageId:string, tests:ITestItem[][]): void {
	tests.forEach((test) => runTest(languageId, test));
}

function runTest(languageId:string, test:ITestItem[]): void {

	let text = test.map(t => t.line).join('\n');
	let actualTokens = _monaco.editor.tokenize(text, languageId);
	let actual = actualTokens.map((lineTokens, index) => {
		return {
			line: test[index].line,
			tokens: lineTokens.map((t) => {
				return {
					startIndex: t.offset,
					type: t.type
				};
			})
		};
	});

	assert.deepEqual(actual, test);
}
