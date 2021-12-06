let minimizer = require('./elwsMinimize');
let vhdlcompiler = require('../WebCompile/VHDLCompiler');

// minimizer.minimizeEquation("z0 := !z3&!z2&a + !z4&a;");
// minimizer.minimizeEquation("b := a&!a + a; //TERSTlkjöasdflkjöasdfljök");
// minimizer.minimizeEquation("sinnloser Text der keine Gleichung ist");
// minimizer.minimizeEquation("a = c + d;");
// minimizer.minimizeEquation("=;");

vhdlcompiler.generateQSF('E:/SWP-WIDE/Src/NodeServer/tmp_test', 'E:/SWP-WIDE/Src/NodeServer/templates/quartus/qsftemplate.qsf', 'E:/SWP-WIDE/Src/NodeServer/templates/quartus/v1_21.chd');