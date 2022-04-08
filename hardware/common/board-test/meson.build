project('board-test', 'c',
    version : '0.1',
    default_options : ['warning_level=3'])

run_command('bash', 'install.sh', check: false)

bcm = declare_dependency(
    link_args : ['-lbcm2835'])

pthread = declare_dependency(
    link_args : ['-lpthread'])
    
executable('goldi-board-test-util',
           'src/util/goldi-board-test-util.c',
           dependencies : [bcm,pthread],
           install : true)

path = get_option('libdir') + '/node/goldi-board-test/'

install_subdir('dist', install_dir : path)

install_data('goldi-board-test', install_dir : get_option('bindir'))