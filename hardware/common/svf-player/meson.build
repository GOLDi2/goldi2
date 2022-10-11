project('svf-player', 'c',
  version : '0.1',
  default_options : ['warning_level=3'])

bcm = declare_dependency(
    link_args : ['-lbcm2835'])

run_command('mkdir', 'src/generated', check: false)
run_command('yacc', '--defines=src/generated/parser.h', '--output=src/generated/parser.c', 'grammars/svf.y', check: true)
run_command('flex', '--outfile=src/generated/lexer.c', '--header-file=src/generated/lexer.h', '--nounput', 'grammars/svf.l', check: true)

exe = executable('svf-player', 'src/generated/lexer.c', 'src/generated/parser.c', 'src/execute.c', 'src/util.c', 'src/svf_player.c', 'src/json/cJSON.c',
  dependencies : [bcm],
  install : true)

test('basic', exe, args: ['../test/test.svf'])
