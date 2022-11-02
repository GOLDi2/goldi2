import { builtinModules } from 'module';
import ignore from 'rollup-plugin-ignore';

import typescript from "rollup-plugin-typescript2";
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

import sass from 'rollup-plugin-sass';

import {terser} from "rollup-plugin-terser";

export default [
       { // app bundle
        input: 'src/controller.ts',
        output: {
            file: 'dist/WIDE/app.js',
            sourcemap: true,
            format: 'iife',
            globals: {
                'monaco-editor': 'monaco',
                'jszip': 'JSZip',
                'file-saver': 'FileSaver',
                'jszip-utils': 'JSZipUtils'
            }
        },
        plugins: [
            ignore(builtinModules),
            sass({
                output: true,
                options: {
                    includePaths: ['node_modules'],
                    style: 'compressed'
                }
            }),
            nodeResolve(),
            typescript({
                tsconfigDefaults: {
                    sourceMap: true,
                }
            }),
            commonjs({
                // non-CommonJS modules will be ignored, but you can also
                // specifically include/exclude files
                include: 'node_modules/**',  // Default: undefined
                exclude: [ 'node_modules/foo/**', 'node_modules/bar/**' ],  // Default: undefined
                // these values can also be regular expressions
                // include: /node_modules/

                // search for files other than .js files (must already
                // be transpiled by a previous plugin!)
                extensions: [ '.js', '.coffee' ],  // Default: [ '.js' ]

                // if true then uses of `global` won't be dealt with by this plugin
                ignoreGlobal: false,  // Default: false

                // if false then skip sourceMap generation for CommonJS modules
                sourceMap: false,  // Default: true

                // explicitly specify unresolvable named exports
                // (see below for more details)
                namedExports: { './module.js': ['foo', 'bar' ] },  // Default: undefined

                // sometimes you have to leave require statements
                // unconverted. Pass an array containing the IDs
                // or a `id => boolean` function. Only use this
                // option if you know what you're doing!
                ignore: [ 'conditional-runtime-dependency' ]
            }),
            terser(),
        ],
        external: [
            'monaco-editor',
            'file-saver',
            'jszip',
            'jszip-utils'
        ]
    },
    { // WIDE.js which will be included in the ECP
        input: 'src/wide.ts',
        output: {
            file: 'dist/WIDE/wide.js',
            moduleName: 'wide',
            name: 'wide',
            sourcemap: true,
            format: 'iife',
        },

        plugins: [
            terser(),
            typescript({
                tsconfigDefaults: {
                    sourceMap: true,
                }
            }),
            nodeResolve(),
        ]
    }
]