define('vs/css', [], {
	load: function (name, req, load) {
		load({});
	}
});

define('vs/nls', [], {
	create: function () {
		return {
			localize: function () {
				return 'NO_LOCALIZATION_FOR_YOU';
			}
		};
	},
	localize: function () {
		return 'NO_LOCALIZATION_FOR_YOU';
	},
	load: function (name, req, load) {
		load({});
	}
});

define(['require'], function () {
	requirejs([
		'vs/editor/editor.main'
	], function () {
		requirejs([
			'monaco-languages/release/dev/apex/apex.test',
			'monaco-languages/release/dev/azcli/azcli.test',
			'monaco-languages/release/dev/bat/bat.test',
			'monaco-languages/release/dev/clojure/clojure.test',
			'monaco-languages/release/dev/coffee/coffee.test',
			'monaco-languages/release/dev/cpp/cpp.test',
			'monaco-languages/release/dev/csharp/csharp.test',
			'monaco-languages/release/dev/csp/csp.test',
			'monaco-languages/release/dev/css/css.test',
			'monaco-languages/release/dev/dockerfile/dockerfile.test',
			'monaco-languages/release/dev/fsharp/fsharp.test',
			'monaco-languages/release/dev/go/go.test',
			'monaco-languages/release/dev/graphql/graphql.test',
			'monaco-languages/release/dev/handlebars/handlebars.test',
			'monaco-languages/release/dev/html/html.test',
			'monaco-languages/release/dev/java/java.test',
			'monaco-languages/release/dev/javascript/javascript.test',
			'monaco-languages/release/dev/kotlin/kotlin.test',
			'monaco-languages/release/dev/less/less.test',
			'monaco-languages/release/dev/lua/lua.test',
			'monaco-languages/release/dev/markdown/markdown.test',
			'monaco-languages/release/dev/msdax/msdax.test',
			'monaco-languages/release/dev/mysql/mysql.test',
			'monaco-languages/release/dev/objective-c/objective-c.test',
			'monaco-languages/release/dev/pascal/pascal.test',
			'monaco-languages/release/dev/perl/perl.test',
			'monaco-languages/release/dev/pgsql/pgsql.test',
			'monaco-languages/release/dev/php/php.test',
			'monaco-languages/release/dev/postiats/postiats.test',
			'monaco-languages/release/dev/powerquery/powerquery.test',
			'monaco-languages/release/dev/powershell/powershell.test',
			'monaco-languages/release/dev/pug/pug.test',
			'monaco-languages/release/dev/python/python.test',
			'monaco-languages/release/dev/r/r.test',
			'monaco-languages/release/dev/razor/razor.test',
			'monaco-languages/release/dev/redis/redis.test',
			'monaco-languages/release/dev/redshift/redshift.test',
			'monaco-languages/release/dev/ruby/ruby.test',
			'monaco-languages/release/dev/rust/rust.test',
			'monaco-languages/release/dev/sb/sb.test',
			'monaco-languages/release/dev/scheme/scheme.test',
			'monaco-languages/release/dev/scss/scss.test',
			'monaco-languages/release/dev/shell/shell.test',
			'monaco-languages/release/dev/solidity/solidity.test',
			'monaco-languages/release/dev/sql/sql.test',
			'monaco-languages/release/dev/st/st.test',
			'monaco-languages/release/dev/swift/swift.test',
			'monaco-languages/release/dev/tcl/tcl.test',
			'monaco-languages/release/dev/typescript/typescript.test',
			'monaco-languages/release/dev/vb/vb.test',
			'monaco-languages/release/dev/xml/xml.test',
			'monaco-languages/release/dev/yaml/yaml.test',
			'monaco-languages/release/dev/vhdl/vhdl.test',
			'monaco-languages/release/dev/logic/logic.test'

		], function () {
			run(); // We can launch the tests!
		}, function (err) {
			console.log(err);
		});
	}, function (err) {
		console.log(err);
	});
});
