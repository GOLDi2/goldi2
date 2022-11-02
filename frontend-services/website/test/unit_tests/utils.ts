import "mocha";
import assert from "assert";
import mock_fs from "mock-fs";

import { find_language_suffixed_files } from "../../src/utils";

describe('utils', function () {
    describe('find_language_suffixed_files()', function () {
        mock_fs({
            'test_all_en.html': '',
            'test_all_de.html': '',
            'test_all.html': '',
            'test_fallback.html': '',
            'test_language_fallback.html': '',
            'test_language_fallback_en.html': '',
            'test_missing_de.html': '',
        })
        it('should not find missing files', async function () {
            try{
                await find_language_suffixed_files('missing.html', 'en');
                assert.fail('Should not find missing files');
            }catch(e){}
        });
        it('should select the right language file', async function(){
            assert(await find_language_suffixed_files('test_all.html', 'en') === 'test_all_en.html');
            assert(await find_language_suffixed_files('test_all.html', 'de') === 'test_all_de.html');
        });
        it('should select the right file with fallback', async function(){
            assert(await find_language_suffixed_files('test_fallback.html', 'en') === 'test_fallback.html');
            assert(await find_language_suffixed_files('test_fallback.html', 'de') === 'test_fallback.html');
            assert(await find_language_suffixed_files('test_language_fallback.html', 'de', 'de') === 'test_language_fallback.html');
        });
        it('should select the right language file with language fallback', async function(){
            assert(await find_language_suffixed_files('test_language_fallback.html', 'en') === 'test_language_fallback_en.html');
            assert(await find_language_suffixed_files('test_language_fallback.html', 'de') === 'test_language_fallback_en.html');
        });
        it('should throw an error when fallback is not available', async function(){
            try{
                await find_language_suffixed_files('test_missing.html', 'en');
                assert.fail('Should not find missing files');
            }catch(e){}
        });
        it('should overwrite the extension', async function () {
            assert(await find_language_suffixed_files('test_all.php', 'en', undefined, '.html') === 'test_all_en.html');
            assert(await find_language_suffixed_files('test_all', 'en', undefined, '.html') === 'test_all_en.html');
            assert(await find_language_suffixed_files('test_all.php', 'en', undefined, 'html') === 'test_all_en.html');
            assert(await find_language_suffixed_files('test_all', 'en', undefined, 'html') === 'test_all_en.html');
        })
    });
});
