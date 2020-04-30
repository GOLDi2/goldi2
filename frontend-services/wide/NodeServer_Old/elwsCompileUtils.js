var fs = require('fs');


/**
 * @param chdPath path to the selected chd as string
 * @returns {Array} Array containing all pins of the selected chip/.chd
 */
exports.getPinNames = function(chdPath) {
    let pinNames = [];
    let rawdata = fs.readFileSync(chdPath); //TODO replace with parameter after testing
    let data = JSON.parse(rawdata);
    data.pinDescriptions.forEach(function (value) {
        pinNames.push(value.pinName);
    });
    // console.log(pinNames);
    return pinNames;
};
// test code
// let code = "input BUTTON1;\n\na = BUTTON1;\n\n\nz0 := !z3&!z2&a + !z4&a;\nz1 := !z3&!z2&!z1&z0&!a + !z4&!z1&z0&!a + !z3&!z2&z1&!z0 + !z3&!z2&z1&a + !z4&z1&!z0 + !z4&z1&a;\nz2 := !z4&!z2&z1&z0&!a + !z4&z2&!z1 + !z4&z2&!z0 + !z4&z2&a;\nz3 := !z4&!z3&z2&z1&z0&!a + !z4&z3&!z2 + !z4&z3&!z1 + !z4&z3&!z0 + !z4&z3&a;\nz4 := !z4&z3&z2&z1&z0&!a + z4&!z3&!z2&!z1 + z4&!z3&!z2&!z0 + z4&!z3&!z2&a;\n \ndigit_0 = !z3&!z2&!z1&z0 + !z3&!z2&z1&!z0 + !z4&!z1&z0 + !z4&z1&!z0;                                                                                                               \ndigit_1 = !z4&!z2&z1&z0 + !z4&z2&!z1 + !z4&z2&!z0;                                                                                               \ndigit_2 = !z4&!z3&z2&z1&z0 + !z4&z3&!z2 + !z4&z3&!z1 + !z4&z3&!z0;                                                                      \ndigit_3 = !z4&z3&z2&z1&z0 + z4&!z3&!z2&!z1 + z4&!z3&!z2&!z0;\n\n// BCD-Decoder\n// 7-Segment Display\n//    0\n//   ---\n// 5| 6 | 1\n//   ---\n// 4| 3 | 2\n//   ---\n \noutput IO10;\noutput IO9;\noutput segment_output_2;\noutput segment_output_3;\noutput segment_output_4;\noutput segment_output_5;\noutput segment_output_6;\n\n\n\nx0 = digit_0;\nx1 = digit_1;\nx2 = digit_2;\nx3 = digit_3;\n\n\nsegment_0 = x3&!x2&!x1 + !x3&!x2&!x0 + !x3&x2&x0 + !x3&x1 + x3&!x2&!x1 + !x3&x2&x0 + !x2&!x1&!x0 + !x3&x1;\n //Segmente sind low-aktiv\nIO10 = !segment_0; \n\nsegment_1 = !x3&!x1&!x0 + !x3&x1&x0 + !x3&!x2 + !x2&!x1;                                                                  \nIO9 = !segment_1;\n\nsegment_2 = !x3&x2 + !x3&x0 + !x2&!x1;                                                                                                                                                                                                                         \nsegment_output_2 = !segment_2;\n\nsegment_3 = !x3&x2&!x1&x0 + !x3&!x2&x1 + x3&!x2&!x1 + !x3&!x2&!x0 + !x3&x1&!x0 + !x3&x2&!x1&x0 + !x3&!x2&x1 + x3&!x2&!x1 + !x3&x1&!x0 + !x2&!x1&!x0;\nsegment_output_3 = !segment_3;\n\nsegment_4 = !x3&x1&!x0 + !x2&!x1&!x0;                           \nsegment_output_4 = !segment_4;\n\nsegment_5 = !x3&x2&!x1 + x3&!x2&!x1 + !x3&x2&!x0 + !x3&!x1&!x0 + !x3&x2&!x1 + x3&!x2&!x1 + !x3&x2&!x0 + !x2&!x1&!x0;\nsegment_output_5 = !segment_5;\n\nsegment_6 = !x3&!x2&x1 + !x3&x2&!x1 + x3&!x2&!x1 + !x3&x2&!x0 + !x3&!x2&x1 + !x3&x2&!x1 + x3&!x2&!x1 + !x3&x1&!x0;\nsegment_output_6 = !segment_6;\n";

exports.renameAllVars = function(code, pinNames) {
    pinNames.forEach(function(value){
        let regexp = new RegExp(value + '\\b', 'g');
        code = code.replace(regexp, value + '_var');
    });
    return code;
};

// test stuff
// let pinNames = getPinNames("E:/SWP-WIDE/Src/ELWS/__workspace/example/v1_00 - Kopie.chd");
// console.log(pinNames);
// let newCode = renameAllVars(code, pinNames);
// console.log(newCode);