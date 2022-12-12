project('board-test', 'c',
    version : '0.1',
    default_options : ['warning_level=3'])

bcm = declare_dependency(
    link_args : ['-lbcm2835'])

pthread = declare_dependency(
    link_args : ['-lpthread'])
    
executable('goldi-board-test-util',
           'src/goldi-board-test-util/goldi-board-test-util.c',
           dependencies : [bcm,pthread],
           install : true)

install_data('goldi-board-test', install_dir : get_option('bindir'))