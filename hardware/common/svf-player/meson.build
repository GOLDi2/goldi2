project('svf-player', 'c',
  version : '0.1',
  default_options : ['warning_level=3'])

bcm = declare_dependency(
    link_args : ['-lbcm2835'])

#run_command('yacc', '-d', '--debug', '--verbose', 'svf.y', check: true)
run_command('yacc', '--defines=src/parser.h', '--output=src/parser.c', 'grammars/svf.y', check: true)
run_command('flex', '--outfile=src/lexer.c', '--header-file=src/lexer.h', '--nounput', 'grammars/svf.l', check: true)

exe = executable('svf_player', 'src/lexer.c', 'src/parser.c', 'src/execute.c', 'src/util.c', 'src/svf_player.c',
  c_args : '-lbcm2835',
  dependencies : [bcm],
  install : true)

test('basic', exe, args: ['../testfile'])
