var WaveDrom = WaveDrom || {};

(function () {
    'use strict';

    var lane, parse, waveSkin;

    parse = JsonML.parse;
    waveSkin = WaveSkin;
    lane = {
        xs     : 20,    // tmpgraphlane0.width
        ys     : 20,    // tmpgraphlane0.height
        xg     : 120,   // tmpgraphlane0.x
        // yg     : 0,     // head gap
        yh0    : 0,     // head gap title
        yh1    : 0,     // head gap
        yf0    : 0,     // foot gap
        yf1    : 0,     // foot gap
        y0     : 5,     // tmpgraphlane0.y
        yo     : 30,    // tmpgraphlane1.y - y0;
        tgo    : -10,   // tmptextlane0.x - xg;
        ym     : 15,    // tmptextlane0.y - y0
        xlabel : 6,     // tmptextlabel.x - xg;
        xmax   : 1,
        scale  : 1,
        head   : {},
        foot   : {}
    };

    function genBrick (texts, extra, times) {
        var i, j, R = [];

        if (texts.length === 4) {
            for (j = 0; j < times; j += 1) {
                R.push(texts[0]);
                for (i = 0; i < extra; i += 1) {
                    R.push(texts[1]);
                }
                R.push(texts[2]);
                for (i = 0; i < extra; i += 1) {
                    R.push(texts[3]);
                }
            }
            return R;
        }
        if (texts.length === 1) {
            texts.push(texts[0]);
        }
        R.push(texts[0]);
        for (i = 0; i < (times * (2 * (extra + 1)) - 1); i += 1) {
            R.push(texts[1]);
        }
        return R;
    }

    function genFirstWaveBrick (text, extra, times) {
        var tmp;

        tmp = [];
        switch (text) {
            case 'p': tmp = genBrick(['pclk', '111', 'nclk', '000'], extra, times); break;
            case 'n': tmp = genBrick(['nclk', '000', 'pclk', '111'], extra, times); break;
            case 'P': tmp = genBrick(['Pclk', '111', 'nclk', '000'], extra, times); break;
            case 'N': tmp = genBrick(['Nclk', '000', 'pclk', '111'], extra, times); break;
            case 'l':
            case 'L':
            case '0': tmp = genBrick(['000'], extra, times); break;
            case 'h':
            case 'H':
            case '1': tmp = genBrick(['111'], extra, times); break;
            case '=': tmp = genBrick(['vvv-2'], extra, times); break;
            case '2': tmp = genBrick(['vvv-2'], extra, times); break;
            case '3': tmp = genBrick(['vvv-3'], extra, times); break;
            case '4': tmp = genBrick(['vvv-4'], extra, times); break;
            case '5': tmp = genBrick(['vvv-5'], extra, times); break;
            case 'd': tmp = genBrick(['ddd'], extra, times); break;
            case 'u': tmp = genBrick(['uuu'], extra, times); break;
            case 'z': tmp = genBrick(['zzz'], extra, times); break;
            default:  tmp = genBrick(['xxx'], extra, times); break;
        }
        return tmp;
    }

    function genWaveBrick (text, extra, times) {
        var x1, x2, x3, y1, y2, x4, x5, x6, xclude, atext, tmp0, tmp1, tmp2, tmp3, tmp4;
        x1 = {p:'pclk', n:'nclk', P:'Pclk', N:'Nclk', h:'pclk', l:'nclk', H:'Pclk', L:'Nclk'};
        x2 = {'0':'0', '1':'1', 'x':'x', 'd':'d', 'u':'u', 'z':'z', '=':'v',  '2':'v',  '3':'v',  '4':'v',  5:'v' };
        x3 = {'0': '', '1': '', 'x': '', 'd': '', 'u': '', 'z': '', '=':'-2', '2':'-2', '3':'-3', '4':'-4', 5:'-5'};
        y1 = {
            'p':'0', 'n':'1',
            'P':'0', 'N':'1',
            'h':'1', 'l':'0',
            'H':'1', 'L':'0',
            '0':'0', '1':'1', 'x':'x', 'd':'d', 'u':'u', 'z':'z', '=':'v', '2':'v', '3':'v', '4':'v', '5':'v'
        };
        y2 = {
            'p': '', 'n': '',
            'P': '', 'N': '',
            'h': '', 'l': '',
            'H': '', 'L': '',
            '0': '', '1': '', 'x': '', 'd': '', 'u': '', 'z': '', '=':'-2', '2':'-2', '3':'-3', '4':'-4', '5':'-5'
        };
        x4 = {
            'p': '111', 'n': '000',
            'P': '111', 'N': '000',
            'h': '111', 'l': '000',
            'H': '111', 'L': '000',
            '0': '000', '1': '111', 'x': 'xxx', 'd': 'ddd', 'u': 'uuu', 'z': 'zzz',
            '=': 'vvv-2', '2': 'vvv-2', '3': 'vvv-3', '4': 'vvv-4', '5': 'vvv-5'
        };
        x5 = {p:'nclk', n:'pclk', P:'nclk', N:'pclk'};
        x6 = {p: '000', n: '111', P: '000', N: '111'};
        xclude = {'hp':'111', 'Hp':'111', 'ln': '000', 'Ln': '000', 'nh':'111', 'Nh':'111', 'pl': '000', 'Pl':'000'};

        atext = text.split('');
        //if (atext.length !== 2) { return genBrick(['xxx'], extra, times); }

        tmp0 = x4[atext[1]];
        tmp1 = x1[atext[1]];
        if (tmp1 === undefined) {
            tmp2 = x2[atext[1]];
            if (tmp2 === undefined) {
                // unknown
                return genBrick(['xxx'], extra, times);
            } else {
                tmp3 = y1[atext[0]];
                if (tmp3 === undefined) {
                    // unknown
                    return genBrick(['xxx'], extra, times);
                }
                // soft curves
                return genBrick([tmp3 + 'm' + tmp2 + y2[atext[0]] + x3[atext[1]], tmp0], extra, times);
            }
        } else {
            tmp4 = xclude[text];
            if (tmp4 !== undefined) {
                tmp1 = tmp4;
            }
            // sharp curves
            tmp2 = x5[atext[1]];
            if (tmp2 === undefined) {
                // hlHL
                return genBrick([tmp1, tmp0], extra, times);
            } else {
                // pnPN
                return genBrick([tmp1, tmp0, tmp2, x6[atext[1]]], extra, times);
            }
        }
    }

    function parseWaveLane (text, extra) {
        var Repeats, Top, Next, Stack = [], R = [], i;

        Stack = text.split('');
        Next  = Stack.shift();

        Repeats = 1;
        while (Stack[0] === '.' || Stack[0] === '|') { // repeaters parser
            Stack.shift();
            Repeats += 1;
        }
        R = R.concat(genFirstWaveBrick(Next, extra, Repeats));

        while (Stack.length) {
            Top = Next;
            Next = Stack.shift();
            Repeats = 1;
            while (Stack[0] === '.' || Stack[0] === '|') { // repeaters parser
                Stack.shift();
                Repeats += 1;
            }
            R = R.concat(genWaveBrick((Top + Next), extra, Repeats));
        }
        for (i = 0; i < lane.phase; i += 1) {
            R.shift();
        }
        return R;
    }

    function parseWaveLanes (sig) {

        function data_extract (e) {
            var tmp = e.data;
            if (tmp === undefined) { return null; }
            if (typeof (tmp) === 'string') { return tmp.split(' '); }
            return tmp;
        }

        var x, sigx, content = [], tmp0 = [];

        for (x in sig) {
            sigx = sig[x];
            lane.period = sigx.period ? sigx.period    : 1;
            lane.phase  = sigx.phase  ? sigx.phase * 2 : 0;
            content.push([]);
            tmp0[0] = sigx.name  || ' ';
            tmp0[1] = sigx.phase || 0;
            content[content.length - 1][0] = tmp0.slice(0);
            content[content.length - 1][1] = sigx.wave ? parseWaveLane(sigx.wave, lane.period * lane.hscale - 1, lane) : null;
            content[content.length - 1][2] = data_extract(sigx);
        }
        return content;
    }

    function findLaneMarkers (lanetext) {
        var i, gcount = 0, lcount = 0, ret = [];

        for (i in lanetext) {
            if (lanetext[i] === 'vvv-2' | lanetext[i] === 'vvv-3' | lanetext[i] === 'vvv-4' | lanetext[i] === 'vvv-5') {
                lcount += 1;
            } else {
                if (lcount !== 0) {
                    ret.push(gcount - ((lcount + 1) / 2));
                    lcount = 0;
                }
            }
            gcount += 1;
        }
        if (lcount !== 0) {
            ret.push(gcount - ((lcount + 1) / 2));
        }

        return ret;
    }

    function renderWaveLane (root, content, index) {
        var i, j, k, g, gg, title, b, labels = [1], name,

            xmax     = 0,
            xgmax    = 0,
            glengths = [],
            svgns    = 'http://www.w3.org/2000/svg',
            xlinkns  = 'http://www.w3.org/1999/xlink',
            xmlns    = 'http://www.w3.org/XML/1998/namespace';

        for (j = 0; j < content.length; j += 1) {
            name = content[j][0][0];
            if (name) { // check name
                g = parse([
                    'g',
                    {
                        id: 'wavelane_' + j + '_' + index,
                        transform: 'translate(0,' + ((lane.y0) + j * lane.yo) + ')'
                    }
                ]);
                root.insertBefore(g, null);
                if (typeof name === 'number') { name += ''; }
                title = parse([
                    'text',
                    {
                        x: lane.tgo,
                        y: lane.ym,
                        class: 'info',
                        // fill: '#0041c4', // Pantone 288C
                        'text-anchor': 'end'
                    },
                    name // + '') // name
                ]);
                title.setAttributeNS(xmlns, 'xml:space', 'preserve');
                g.insertBefore(title, null);

                // scale = lane.xs * (lane.hscale) * 2;
                glengths.push(title.getBBox().width);

                var xoffset;
                xoffset = content[j][0][1];
                xoffset = (xoffset > 0) ? (Math.ceil(2 * xoffset) - 2 * xoffset) :
                    (-2 * xoffset);
                gg = parse([
                    'g',
                    {
                        id: 'wavelane_draw_' + j + '_' + index,
                        transform: 'translate(' + (xoffset * lane.xs) + ', 0)'
                    }
                ]);
                g.insertBefore(gg, null);

                if (content[j][1]) {
                    for (i = 0; i < content[j][1].length; i += 1) {
                        b    = document.createElementNS(svgns, 'use');
                        // b.id = 'use_' + i + '_' + j + '_' + index;
                        b.setAttributeNS(xlinkns, 'xlink:href', '#' + content[j][1][i]);
                        // b.setAttribute('transform', 'translate(' + (i * lane.xs) + ')');
                        b.setAttribute('transform', 'translate(' + (i * lane.xs) + ')');
                        gg.insertBefore(b, null);
                    }
                    if (content[j][2] && content[j][2].length) {
                        labels = findLaneMarkers(content[j][1]);

                        if (labels.length !== 0) {
                            for (k in labels) {
                                if (content[j][2] && (typeof content[j][2][k] !== 'undefined')) {
                                    title = parse([
                                        'text',
                                        {
                                            x: labels[k] * lane.xs + lane.xlabel,
                                            y: lane.ym,
                                            'text-anchor': 'middle'
                                        },
                                        content[j][2][k] // + '')
                                    ]);
                                    title.setAttributeNS(xmlns, 'xml:space', 'preserve');
                                    gg.insertBefore(title, null);
                                }
                            }
                        }
                    }
                    if (content[j][1].length > xmax) {
                        xmax = content[j][1].length;
                    }
                }
            }
        }
        lane.xmax = xmax;
        lane.xg = xgmax + 20;
        return glengths;
    }

    function renderMarks (root, content, index) {
        var i, g, marks, mstep, mmstep, gy, xmlns; // svgns

        function captext (cxt, anchor, y) {
            var tmark;

            if (cxt[anchor] && cxt[anchor].text) {
                tmark = parse([
                    'text',
                    {
                        x: cxt.xmax * cxt.xs / 2,
                        y: y,
                        'text-anchor': 'middle',
                        fill: '#000'
                    }, cxt[anchor].text
                ]);
                tmark.setAttributeNS(xmlns, 'xml:space', 'preserve');
                g.insertBefore(tmark, null);
            }
        }

        function ticktock (cxt, ref1, ref2, x, dx, y, len) {
            var tmark, step = 1, offset, dp = 0, val, L = [], tmp;

            if (cxt[ref1] === undefined || cxt[ref1][ref2] === undefined) { return; }
            val = cxt[ref1][ref2];
            if (typeof val === 'string') {
                val = val.split(' ');
            } else if (typeof val === 'number' || typeof val === 'boolean') {
                offset = Number(val);
                val = [];
                for (i = 0; i < len; i += 1) {
                    val.push(i + offset);
                }
            }
            if (Object.prototype.toString.call(val) === '[object Array]') {
                if (val.length === 0) {
                    return;
                } else if (val.length === 1) {
                    offset = Number(val[0]);
                    if (isNaN(offset)) {
                        L = val;
                    } else {
                        for (i = 0; i < len; i += 1) {
                            L[i] = i + offset;
                        }
                    }
                } else if (val.length === 2) {
                    offset = Number(val[0]);
                    step   = Number(val[1]);
                    tmp = val[1].split('.');
                    if ( tmp.length === 2 ) {
                        dp = tmp[1].length;
                    }
                    if (isNaN(offset) || isNaN(step)) {
                        L = val;
                    } else {
                        offset = step * offset;
                        for (i = 0; i < len; i += 1) {
                            L[i] = (step * i + offset).toFixed(dp);
                        }
                    }
                } else {
                    L = val;
                }
            } else {
                return;
            }
            for (i = 0; i < len; i += 1) {
                tmp = L[i];
                if (typeof tmp === 'number') { tmp += ''; }
                tmark = parse([
                    'text',
                    {
                        x: i * dx + x,
                        y: y,
                        'text-anchor': 'middle',
                        //					fill: '#AAA'
                        class: 'muted'
                    }, tmp
                ]);
                tmark.setAttributeNS(xmlns, 'xml:space', 'preserve');
                g.insertBefore(tmark, null);
            }
        }

        // svgns = 'http://www.w3.org/2000/svg';
        xmlns = 'http://www.w3.org/XML/1998/namespace';

        mstep  = 2 * (lane.hscale);
        mmstep = mstep * lane.xs;
        marks  = lane.xmax / mstep;
        gy     = content.length * lane.yo;

        g = parse(['g', {id: ('gmarks_' + index)}]);
        root.insertBefore(g, root.firstChild);

        for (i = 0; i < (marks + 1); i += 1) {
            g.insertBefore(
                parse([
                    'path',
                    {
                        id:    'gmark_' + i + '_' + index,
                        d:     'm ' + (i * mmstep) + ',' + 0 + ' 0,' + gy,
                        style: 'stroke:#888;stroke-width:0.5;stroke-dasharray:1,3'
                    }
                ]),
                null
            );
        }

        captext(lane, 'head', (lane.yh0 ? -33 : -13));
        captext(lane, 'foot', gy + (lane.yf0 ? 45 : 25));

        ticktock(lane, 'head', 'tick',          0, mmstep,      -5, marks + 1);
        ticktock(lane, 'head', 'tock', mmstep / 2, mmstep,      -5, marks);
        ticktock(lane, 'foot', 'tick',          0, mmstep, gy + 15, marks + 1);
        ticktock(lane, 'foot', 'tock', mmstep / 2, mmstep, gy + 15, marks);
    }

    function renderGroups (root, groups, index) {
        var i, group, label, x, y, name, // g grouplabel
            svgns = 'http://www.w3.org/2000/svg',
            xmlns = 'http://www.w3.org/XML/1998/namespace';

        for (i in groups) {
            group = document.createElementNS(svgns, 'path');
            group.id = ('group_' + i + '_' + index);
            group.setAttribute('d', 'm ' + (groups[i].x + 0.5) + ',' + (groups[i].y * lane.yo + 3.5 + lane.yh0 + lane.yh1) + ' c -3,0 -5,2 -5,5 l 0,' + (groups[i].height * lane.yo - 16) + ' c 0,3 2,5 5,5');
            group.setAttribute('style', 'stroke:#0041c4;stroke-width:1;fill:none');
            root.insertBefore(group, null);

            name = groups[i].name;
            if (typeof name !== 'undefined') {
                if (typeof name === 'number') { name += ''; }
                x = (groups[i].x - 10);
                y = (lane.yo * (groups[i].y + (groups[i].height / 2)) + lane.yh0 + lane.yh1);
                label = parse([
                    'text',
                    {
                        x: x,
                        y: y,
                        'text-anchor': 'middle',
                        //				fill: '#0041c4',
                        class: 'info',
                        transform: 'rotate(270,' + x + ',' + y + ')'
                    },
                    name
                ]);
                label.setAttributeNS(xmlns, 'xml:space', 'preserve');
                root.insertBefore(label, null);
            }
        }
    }

    function renderGaps (root, source, index) {
        var i, gg, g, b, pos, Stack = [], text,
            svgns   = 'http://www.w3.org/2000/svg',
            xlinkns = 'http://www.w3.org/1999/xlink';

        if (source) {

            gg = document.createElementNS(svgns, 'g');
            gg.id = 'wavegaps_' + index;
            //gg.setAttribute('transform', 'translate(' + lane.xg + ')');
            root.insertBefore(gg, null);

            for (i in source) {
                lane.period = source[i].period ? source[i].period    : 1;
                lane.phase  = source[i].phase  ? source[i].phase * 2 : 0;
                g = document.createElementNS(svgns, 'g');
                g.id = 'wavegap_' + i + '_' + index;
                g.setAttribute('transform', 'translate(0,' + (lane.y0 + i * lane.yo) + ')');
                gg.insertBefore(g, null);

                text = source[i].wave;
                if (text) {
                    Stack = text.split('');
                    pos = 0;
                    while (Stack.length) {
                        if (Stack.shift() === '|') {
                            b    = document.createElementNS(svgns, 'use');
                            //						b.id = 'guse_' + pos + '_' + i + '_' + index;
                            b.setAttributeNS(xlinkns, 'xlink:href', '#gap');
                            b.setAttribute('transform', 'translate(' + (lane.xs * ((2 * pos + 1) * lane.period * lane.hscale - lane.phase)) + ')');
                            g.insertBefore(b, null);
                        }
                        pos += 1;
                    }
                }
            }
        }
    }

    function renderArcs (root, source, index, top) {
        var gg,
            i,
            k,
            text,
            Stack = [],
            Edge = {words: [], from: 0, shape: '', to: 0, label: ''},
            Events = {},
            pos,
            eventname,
            // labeltext,
            label,
            underlabel,
            from,
            to,
            gmark,
            lwidth,
            svgns = 'http://www.w3.org/2000/svg',
            xmlns = 'http://www.w3.org/XML/1998/namespace';

        function t1 () {
            gmark = document.createElementNS(svgns, 'path');
            gmark.id = ('gmark_' + Edge.from + '_' + Edge.to);
            gmark.setAttribute('d', 'M ' + from.x + ',' + from.y + ' ' + to.x   + ',' + to.y);
            gmark.setAttribute('style', 'fill:none;stroke:#00F;stroke-width:1');
            gg.insertBefore(gmark, null);
        }

        if (source) {
            for (i in source) {
                lane.period = source[i].period ? source[i].period    : 1;
                lane.phase  = source[i].phase  ? source[i].phase * 2 : 0;
                text = source[i].node;
                if (text) {
                    Stack = text.split('');
                    pos = 0;
                    while (Stack.length) {
                        eventname = Stack.shift();
                        if (eventname !== '.') {
                            Events[eventname] = {
                                'x' : lane.xs * (2 * pos * lane.period * lane.hscale - lane.phase) + lane.xlabel,
                                'y' : i * lane.yo + lane.y0 + lane.ys * 0.5
                            };
                        }
                        pos += 1;
                    }
                }
            }
            gg = document.createElementNS(svgns, 'g');
            gg.id = 'wavearcs_' + index;
            root.insertBefore(gg, null);
            if (top.edge) {
                for (i in top.edge) {
                    Edge.words = top.edge[i].split(' ');
                    Edge.label = top.edge[i].substring(Edge.words[0].length);
                    Edge.label = Edge.label.substring(1);
                    Edge.from  = Edge.words[0].substr(0, 1);
                    Edge.to    = Edge.words[0].substr(-1, 1);
                    Edge.shape = Edge.words[0].slice(1, -1);
                    from  = Events[Edge.from];
                    to    = Events[Edge.to];
                    t1();
                    if (Edge.label) {
                        label = parse([
                            'text',
                            {
                                style: 'font-size:10px;',
                                'text-anchor': 'middle'
                            },
                            Edge.label + ''
                        ]);
                        label.setAttributeNS(xmlns, 'xml:space', 'preserve');
                        underlabel = parse([
                            'rect',
                            {
                                height: 9,
                                style: 'fill:#FFF;'
                            }
                        ]);
                        gg.insertBefore(underlabel, null);
                        gg.insertBefore(label, null);
                        lwidth = label.getBBox().width;
                        underlabel.setAttribute('width', lwidth);
                    }
                    var dx = to.x - from.x;
                    var dy = to.y - from.y;
                    var lx = ((from.x + to.x) / 2);
                    var ly = ((from.y + to.y) / 2);
                    switch (Edge.shape) {
                        case '-'  : {
                            break;
                        }
                        case '~'  : {
                            gmark.setAttribute('d', 'M ' + from.x + ',' + from.y + ' c ' + (0.7 * dx) + ', 0 ' + (0.3 * dx) + ', ' + dy + ' ' + dx + ', ' + dy);
                            break;
                        }
                        case '-~' : {
                            gmark.setAttribute('d', 'M ' + from.x + ',' + from.y + ' c ' + (0.7 * dx) + ', 0 ' +         dx + ', ' + dy + ' ' + dx + ', ' + dy);
                            if (Edge.label) { lx = (from.x + (to.x - from.x) * 0.75); }
                            break;
                        }
                        case '~-' : {
                            gmark.setAttribute('d', 'M ' + from.x + ',' + from.y + ' c ' + 0          + ', 0 ' + (0.3 * dx) + ', ' + dy + ' ' + dx + ', ' + dy);
                            if (Edge.label) { lx = (from.x + (to.x - from.x) * 0.25); }
                            break;
                        }
                        case '-|' : {
                            gmark.setAttribute('d', 'm ' + from.x + ',' + from.y + ' ' + dx + ',0 0,' + dy);
                            if (Edge.label) { lx = to.x; }
                            break;
                        }
                        case '|-' : {
                            gmark.setAttribute('d', 'm ' + from.x + ',' + from.y + ' 0,' + dy + ' ' + dx + ',0');
                            if (Edge.label) { lx = from.x; }
                            break;
                        }
                        case '-|-': {
                            gmark.setAttribute('d', 'm ' + from.x + ',' + from.y + ' ' + (dx / 2) + ',0 0,' + dy + ' ' + (dx / 2) + ',0');
                            break;
                        }
                        case '->' : {
                            gmark.setAttribute('style', 'marker-end:url(#arrowhead);stroke:#0041c4;stroke-width:1;fill:none');
                            break;
                        }
                        case '~>' : {
                            gmark.setAttribute('style', 'marker-end:url(#arrowhead);stroke:#0041c4;stroke-width:1;fill:none');
                            gmark.setAttribute('d', 'M ' + from.x + ',' + from.y + ' ' + 'c ' + (0.7 * dx) + ', 0 ' + 0.3 * dx + ', ' + dy + ' ' + dx + ', ' + dy);
                            break;
                        }
                        case '-~>': {
                            gmark.setAttribute('style', 'marker-end:url(#arrowhead);stroke:#0041c4;stroke-width:1;fill:none');
                            gmark.setAttribute('d', 'M ' + from.x + ',' + from.y + ' ' + 'c ' + (0.7 * dx) + ', 0 ' +     dx + ', ' + dy + ' ' + dx + ', ' + dy);
                            if (Edge.label) { lx = (from.x + (to.x - from.x) * 0.75); }
                            break;
                        }
                        case '~->': {
                            gmark.setAttribute('style', 'marker-end:url(#arrowhead);stroke:#0041c4;stroke-width:1;fill:none');
                            gmark.setAttribute('d', 'M ' + from.x + ',' + from.y + ' ' + 'c ' + 0      + ', 0 ' + (0.3 * dx) + ', ' + dy + ' ' + dx + ', ' + dy);
                            if (Edge.label) { lx = (from.x + (to.x - from.x) * 0.25); }
                            break;
                        }
                        case '-|>' : {
                            gmark.setAttribute('style', 'marker-end:url(#arrowhead);stroke:#0041c4;stroke-width:1;fill:none');
                            gmark.setAttribute('d', 'm ' + from.x + ',' + from.y + ' ' + dx + ',0 0,' + dy);
                            if (Edge.label) { lx = to.x; }
                            break;
                        }
                        case '|->' : {
                            gmark.setAttribute('style', 'marker-end:url(#arrowhead);stroke:#0041c4;stroke-width:1;fill:none');
                            gmark.setAttribute('d', 'm ' + from.x + ',' + from.y + ' 0,' + dy + ' ' + dx + ',0');
                            if (Edge.label) { lx = from.x; }
                            break;
                        }
                        case '-|->': {
                            gmark.setAttribute('style', 'marker-end:url(#arrowhead);stroke:#0041c4;stroke-width:1;fill:none');
                            gmark.setAttribute('d', 'm ' + from.x + ',' + from.y + ' ' + (dx / 2) + ',0 0,' + dy + ' ' + (dx / 2) + ',0');
                            break;
                        }
                        case '<->' : {
                            gmark.setAttribute('style', 'marker-end:url(#arrowhead);marker-start:url(#arrowtail);stroke:#0041c4;stroke-width:1;fill:none');
                            break;
                        }
                        case '<~>' : {
                            gmark.setAttribute('style', 'marker-end:url(#arrowhead);marker-start:url(#arrowtail);stroke:#0041c4;stroke-width:1;fill:none');
                            gmark.setAttribute('d', 'M ' + from.x + ',' + from.y + ' ' + 'c ' + (0.7 * dx) + ', 0 ' + (0.3 * dx) + ', ' + dy + ' ' + dx + ', ' + dy);
                            break;
                        }
                        case '<-~>': {
                            gmark.setAttribute('style', 'marker-end:url(#arrowhead);marker-start:url(#arrowtail);stroke:#0041c4;stroke-width:1;fill:none');
                            gmark.setAttribute('d', 'M ' + from.x + ',' + from.y + ' ' + 'c ' + (0.7 * dx) + ', 0 ' +     dx + ', ' + dy + ' ' + dx + ', ' + dy);
                            if (Edge.label) { lx = (from.x + (to.x - from.x) * 0.75); }
                            break;
                        }
                        case '<-|>' : {
                            gmark.setAttribute('style', 'marker-end:url(#arrowhead);marker-start:url(#arrowtail);stroke:#0041c4;stroke-width:1;fill:none');
                            gmark.setAttribute('d', 'm ' + from.x + ',' + from.y + ' ' + dx + ',0 0,' + dy);
                            if (Edge.label) { lx = to.x; }
                            break;
                        }
                        case '<-|->': {
                            gmark.setAttribute('style', 'marker-end:url(#arrowhead);marker-start:url(#arrowtail);stroke:#0041c4;stroke-width:1;fill:none');
                            gmark.setAttribute('d', 'm ' + from.x + ',' + from.y + ' ' + (dx / 2) + ',0 0,' + dy + ' ' + (dx / 2) + ',0');
                            break;
                        }
                        default   : { gmark.setAttribute('style', 'fill:none;stroke:#F00;stroke-width:1'); }
                    }
                    if (Edge.label) {
                        label.setAttribute('x', lx);
                        label.setAttribute('y', ly + 3);
                        underlabel.setAttribute('x', lx - lwidth / 2);
                        underlabel.setAttribute('y', ly - 5);
                    }
                }
            }
            for (k in Events) {
                if (k === k.toLowerCase()) {
                    if (Events[k].x > 0) {
                        underlabel = parse([
                            'rect',
                            {
                                y: Events[k].y - 4,
                                height: 8,
                                style: 'fill:#FFF;'
                            }
                        ]);
                        gg.insertBefore(underlabel, null);
                        label = parse([
                            'text',
                            {
                                style: 'font-size:8px;',
                                x: Events[k].x,
                                y: Events[k].y + 2,
                                'text-anchor': 'middle'
                            },
                            (k + '')
                        ]);
                        gg.insertBefore(label, null);
                        lwidth = label.getBBox().width + 2;
                        underlabel.setAttribute('x', Events[k].x - lwidth / 2);
                        underlabel.setAttribute('width', lwidth);
                    }
                }
            }
        }
    }

    function parseConfig (source) {
        var hscale;

        function tonumber (x) {
            return x > 0 ? Math.round(x) : 1;
        }

        lane.hscale = 1;
        if (lane.hscale0) {
            lane.hscale = lane.hscale0;
        }
        if (source && source.config && source.config.hscale) {
            hscale = Math.round(tonumber(source.config.hscale));
            if (hscale > 0) {
                if (hscale > 100) {
                    hscale = 100;
                }
                lane.hscale = hscale;
            }
        }
        lane.yh0 = 0;
        lane.yh1 = 0;
        lane.head = source.head;
        if (source && source.head) {
            if (source.head.tick || source.head.tick === 0) { lane.yh0 = 20; }
            if (source.head.tock || source.head.tock === 0) { lane.yh0 = 20; }
            if (source.head.text) { lane.yh1 = 46; lane.head.text = source.head.text; }
        }
        lane.yf0 = 0;
        lane.yf1 = 0;
        lane.foot = source.foot;
        if (source && source.foot) {
            if (source.foot.tick || source.foot.tick === 0) { lane.yf0 = 20; }
            if (source.foot.tock || source.foot.tock === 0) { lane.yf0 = 20; }
            if (source.foot.text) { lane.yf1 = 46; lane.foot.text = source.foot.text; }
        }
    }

    function rec (tmp, state) {
        var i, name, old = {}, delta = {'x':10};
        if (typeof tmp[0] === 'string' || typeof tmp[0] === 'number') {
            name = tmp[0];
            delta.x = 25;
        }
        state.x += delta.x;
        for (i = 0; i < tmp.length; i++) {
            if (typeof tmp[i] === 'object') {
                if (Object.prototype.toString.call(tmp[i]) === '[object Array]') {
                    old.y = state.y;
                    state = rec(tmp[i], state);
                    state.groups.push({'x':state.xx, 'y':old.y, 'height':(state.y - old.y), 'name':state.name});
                } else {
                    state.lanes.push(tmp[i]);
                    state.width.push(state.x);
                    state.y += 1;
                }
            }
        }
        state.xx = state.x;
        state.x -= delta.x;
        state.name = name;
        return state;
    }

    // index: index of original script tag, parent: element where the SVG lives later?, source: parsed WaveJSON
    function insertSVGTemplate (index, parent, source) {
        var node, first, e;

        // cleanup, remove all child Nodes?
        while (parent.childNodes.length) {
            parent.removeChild(parent.childNodes[0]);
        }

        for (first in waveSkin) { break; }

        e = waveSkin.default || waveSkin[first];

        if (source && source.config && source.config.skin && waveSkin[source.config.skin]) {
            e = waveSkin[source.config.skin];
        }

        if (index === 0) {
            lane.xs     = Number(e[3][1][2][1].width);
            lane.ys     = Number(e[3][1][2][1].height);
            lane.xlabel = Number(e[3][1][2][1].x);
            lane.ym     = Number(e[3][1][2][1].y);
        } else {
            e =
                ['svg', {id: 'svg', xmlns: 'http://www.w3.org/2000/svg', 'xmlns:xlink': 'http://www.w3.org/1999/xlink', height: '0'},
                    ['g', {id: 'waves'},
                        ['g', {id: 'lanes'}],
                        ['g', {id: 'groups'}]
                    ]
                ];
        }

        e[e.length - 1][1].id    = 'waves_'  + index;
        e[e.length - 1][2][1].id = 'lanes_'  + index;
        e[e.length - 1][3][1].id = 'groups_' + index;
        e[1].id = 'svgcontent_' + index;
        e[1].height = 0;

        node = parse(e);
        parent.insertBefore(node, null);
    }

    function insertSVGTemplateAssign (index, parent) {
        var node, e;
        // cleanup
        while (parent.childNodes.length) {
            parent.removeChild(parent.childNodes[0]);
        }
        e =
            ['svg', {id: 'svgcontent_' + index, xmlns:'http://www.w3.org/2000/svg', 'xmlns:xlink':'http://www.w3.org/1999/xlink', overflow:'hidden'},
                ['style', '.pinname {font-size:12px; font-style:normal; font-variant:normal; font-weight:500; font-stretch:normal; text-align:center; text-anchor:end; font-family:Helvetica} .wirename {font-size:12px; font-style:normal; font-variant:normal; font-weight:500; font-stretch:normal; text-align:center; text-anchor:start; font-family:Helvetica} .wirename:hover {fill:blue} .gate {color:#000; fill:#ffc; fill-opacity: 1;stroke:#000; stroke-width:1; stroke-opacity:1} .gate:hover {fill:red !important; } .wire {fill:none; stroke:#000; stroke-width:1; stroke-opacity:1} .grid {fill:#fff; fill-opacity:1; stroke:none}']
            ];
        node = parse(e);
        parent.insertBefore(node, null);
    }

    function renderAssign (index, source) {

        function render (tree, state) {
            var y, i, ilen;

            state.xmax = Math.max(state.xmax, state.x);
            y = state.y;
            ilen = tree.length;
            for (i = 1; i < ilen; i++) {
                if (Object.prototype.toString.call(tree[i]) === '[object Array]') {
                    state = render(tree[i], {x: (state.x + 1), y: state.y, xmax: state.xmax});
                } else {
                    tree[i] = {name:tree[i], x: (state.x + 1), y: state.y};
                    state.y += 2;
                }
            }
            tree[0] = {name: tree[0], x: state.x, y: Math.round((y + (state.y - 2)) / 2)};
            state.x--;
            return state;
        }

        function draw_body (type, ymin, ymax) {
            var e, l, iecs,
                circle = ' M 4,0 C 4,1.1 3.1,2 2,2 0.9,2 0,1.1 0,0 c 0,-1.1 0.9,-2 2,-2 1.1,0 2,0.9 2,2 z',
                gates = {
                    '~':  'M -11,-6 -11,6 0,0 z m -5,6 5,0' + circle,
                    '=':  'M -11,-6 -11,6 0,0 z m -5,6 5,0',
                    '&':  'm -16,-10 5,0 c 6,0 11,4 11,10 0,6 -5,10 -11,10 l -5,0 z',
                    '~&': 'm -16,-10 5,0 c 6,0 11,4 11,10 0,6 -5,10 -11,10 l -5,0 z' + circle,
                    '|':  'm -18,-10 4,0 c 6,0 12,5 14,10 -2,5 -8,10 -14,10 l -4,0 c 2.5,-5 2.5,-15 0,-20 z',
                    '~|': 'm -18,-10 4,0 c 6,0 12,5 14,10 -2,5 -8,10 -14,10 l -4,0 c 2.5,-5 2.5,-15 0,-20 z' + circle,
                    '^':  'm -21,-10 c 1,3 2,6 2,10 m 0,0 c 0,4 -1,7 -2,10 m 3,-20 4,0 c 6,0 12,5 14,10 -2,5 -8,10 -14,10 l -4,0 c 1,-3 2,-6 2,-10 0,-4 -1,-7 -2,-10 z',
                    '~^': 'm -21,-10 c 1,3 2,6 2,10 m 0,0 c 0,4 -1,7 -2,10 m 3,-20 4,0 c 6,0 12,5 14,10 -2,5 -8,10 -14,10 l -4,0 c 1,-3 2,-6 2,-10 0,-4 -1,-7 -2,-10 z' + circle,
                    '+':  'm -8,5 0,-10 m -5,5 10,0 m 3,0 c 0,4.418278 -3.581722,8 -8,8 -4.418278,0 -8,-3.581722 -8,-8 0,-4.418278 3.581722,-8 8,-8 4.418278,0 8,3.581722 8,8 z',
                    '*':  'm -4,4 -8,-8 m 0,8 8,-8 m 4,4 c 0,4.418278 -3.581722,8 -8,8 -4.418278,0 -8,-3.581722 -8,-8 0,-4.418278 3.581722,-8 8,-8 4.418278,0 8,3.581722 8,8 z'
                },
                iec = {
                    BUF: 1, INV: 1, AND: '&',  NAND: '&',
                    OR: '\u22651', NOR: '\u22651', XOR: '=1', XNOR: '=1', box: ''
                },
                circled = { INV: 1, NAND: 1, NOR: 1, XNOR: 1 };

            if (ymax === ymin) {
                ymax = 4; ymin = -4;
            }
            e = gates[type];
            iecs = iec[type];
            if (e) {
                return ['path', {class:'gate', d: e}];
            } else {
                if (iecs) {
                    return [
                        'g', [
                            'path', {
                                class:'gate',
                                d: 'm -16,' + (ymin - 3) + ' 16,0 0,' + (ymax - ymin + 6) + ' -16,0 z' + (circled[type] ? circle : '')
                            }], [
                            'text', [
                                'tspan', {x: '-14', y: '4', class: 'wirename'}, iecs + ''
                            ]
                        ]
                    ];
                } else {
                    return ['text', ['tspan', {x: '-14', y: '4', class: 'wirename'}, type + '']];
                }
            }
        }
        function draw_gate (spec) { // ['type', [x,y], [x,y] ... ]
            var i,
                ret = ['g'],
                ys = [],
                ymin,
                ymax,
                ilen = spec.length;

            for (i = 2; i < ilen; i++) {
                ys.push(spec[i][1]);
            }

            ymin = Math.min.apply(null, ys);
            ymax = Math.max.apply(null, ys);

            ret.push(
                ['g',
                    {transform:'translate(16,0)'},
                    ['path', {
                        d: 'M  ' + spec[2][0] + ',' + ymin + ' ' + spec[2][0] + ',' + ymax,
                        class: 'wire'
                    }]
                ]
            );

            for (i = 2; i < ilen; i++) {
                ret.push(
                    ['g',
                        ['path',
                            {
                                d: 'm  ' + spec[i][0] + ',' + spec[i][1] + ' 16,0',
                                class: 'wire'
                            }
                        ]
                    ]
                );
            }
            ret.push(
                ['g', { transform: 'translate(' + spec[1][0] + ',' + spec[1][1] + ')' },
                    ['title', spec[0]],
                    draw_body(spec[0], ymin - spec[1][1], ymax - spec[1][1])
                ]
            );
            return ret;
        }
        function draw_boxes (tree, xmax) {
            var ret = ['g'], i, ilen, fx, fy, fname, spec = [];
            if (Object.prototype.toString.call(tree) === '[object Array]') {
                ilen = tree.length;
                spec.push(tree[0].name);
                spec.push([32 * (xmax - tree[0].x), 8 * tree[0].y]);
                for (i = 1; i < ilen; i++) {
                    if (Object.prototype.toString.call(tree[i]) === '[object Array]') {
                        spec.push([32 * (xmax - tree[i][0].x), 8 * tree[i][0].y]);
                    } else {
                        spec.push([32 * (xmax - tree[i].x), 8 * tree[i].y]);
                    }
                }
                ret.push(draw_gate(spec));
                for (i = 1; i < ilen; i++) {
                    ret.push(draw_boxes(tree[i], xmax));
                }
            } else {
                fname = tree.name;
                fx = 32 * (xmax - tree.x);
                fy = 8 * tree.y;
                ret.push(
                    ['g', { transform: 'translate(' + fx + ',' + fy + ')'},
                        ['title', fname],
                        ['path', {d:'M 2,0 a 2,2 0 1 1 -4,0 2,2 0 1 1 4,0 z'}],
                        ['text',
                            ['tspan', {
                                x:'-4', y:'4',
                                class:'pinname'},
                                fname
                            ]
                        ]
                    ]
                );
            }
            return ret;
        }

        var tree, state, xmax, svg = ['g'], grid = ['g'], svgcontent, width, height, i, ilen, j, jlen;
        ilen = source.assign.length;
        state = { x: 0, y: 2, xmax: 0 };
        tree = source.assign;
        for (i = 0; i < ilen; i++) {
            state = render(tree[i], state);
            state.x++;
        }
        xmax = state.xmax + 3;

        for (i = 0; i < ilen; i++) {
            svg.push(draw_boxes(tree[i], xmax));
        }
        width  = 32 * (xmax + 1) + 1;
        height = 8 * (state.y + 1) - 7;
        ilen = 4 * (xmax + 1);
        jlen = state.y + 1;
        for (i = 0; i <= ilen; i++) {
            for (j = 0; j <= jlen; j++) {
                grid.push(['rect', {
                    height: 1,
                    width: 1,
                    x: (i * 8 - 0.5),
                    y: (j * 8 - 0.5),
                    class: 'grid'
                }]);
            }
        }
        svgcontent = document.getElementById('svgcontent_' + index);
        svgcontent.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
        svgcontent.setAttribute('width', width);
        svgcontent.setAttribute('height', height);
        svgcontent.insertBefore(JsonML.parse(['g', {transform:'translate(0.5, 0.5)'}, grid, svg]), null);
    }

    function eva (id) { // takes the div with id InputJSON_[INDEX], performs sematics/syntax checks and returns the parsed JSON
        var TheTextBox, source;

        function erra (e) {
            console.log(e.stack);
            return { signal: [{ name: ['tspan', ['tspan', {class:'error h5'}, 'Error: '], e.message] }]};
        }

        TheTextBox = document.getElementById(id); // InputJSON_[INDEX]

        /* eslint-disable no-eval */
        if (TheTextBox.type && TheTextBox.type === 'textarea') {
            try { source = eval('(' + TheTextBox.value + ')'); } catch (e) { return erra(e); }
        } else {
            try { source = eval('(' + TheTextBox.innerHTML + ')'); } catch (e) { return erra(e); }
        }
        /* eslint-enable  no-eval */

        // source is now parsed WaveJSON

        if (Object.prototype.toString.call(source) !== '[object Object]') {
            return erra({ message: '[Semantic]: The root has to be an Object: "{signal:[...]}"'});
        }
        if (source.signal) {
            if (Object.prototype.toString.call(source.signal) !== '[object Array]') {
                return erra({ message: '[Semantic]: "signal" object has to be an Array "signal:[]"'});
            }
        } else if (source.assign) {
            if (Object.prototype.toString.call(source.assign) !== '[object Array]') {
                return erra({ message: '[Semantic]: "assign" object hasto be an Array "assign:[]"'});
            }
        } else {
            return erra({ message: '[Semantic]: "signal:[...]" or "assign:[...]" property is missing inside the root Object'});
        }
        return source;
    }

    // params: index: index of the original script tag, source: parsed WaveJSON (object), output: String: 'WaveDrom_Display_'
    export function renderWaveForm (index, source, output) {
        var ret,
            root, groups, svgcontent, content, width, height,
            glengths, xmax = 0, i;

        if (source.signal) {
            insertSVGTemplate(index, document.getElementById(output + index), source);
            parseConfig(source);
            ret = rec(source.signal, {'x':0, 'y':0, 'xmax':0, 'width':[], 'lanes':[], 'groups':[]});
            root          = document.getElementById('lanes_' + index);
            groups        = document.getElementById('groups_' + index);
            content  = parseWaveLanes(ret.lanes, lane);
            glengths = renderWaveLane(root, content, index);
            for (i in glengths) {
                xmax = Math.max(xmax, (glengths[i] + ret.width[i]));
            }
            renderMarks(root, content, index);
            renderArcs(root, ret.lanes, index, source);
            renderGaps(root, ret.lanes, index);
            renderGroups(groups, ret.groups, index);
            lane.xg = Math.ceil((xmax - lane.tgo) / lane.xs) * lane.xs;
            width  = (lane.xg + (lane.xs * (lane.xmax + 1)));
            height = (content.length * lane.yo +
                lane.yh0 + lane.yh1 + lane.yf0 + lane.yf1);

            svgcontent = document.getElementById('svgcontent_' + index);
            svgcontent.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
            svgcontent.setAttribute('width', width);
            svgcontent.setAttribute('height', height);
            svgcontent.setAttribute('overflow', 'hidden');
            root.setAttribute('transform', 'translate(' + (lane.xg + 0.5) + ', ' + ((lane.yh0 + lane.yh1) + 0.5) + ')');
        } else if (source.assign) {
            insertSVGTemplateAssign(index, document.getElementById(output + index), source);
            renderAssign(index, source);
        }
    }

    function processAll () {
        var points, //all script tags
            i,
            index,
            node0;
        // node1;

        // first pass: create div with id InputJSON_[INDEX] and insert it before the script with type WaveDrom
        index = 0; // actual number of valid anchor
        points = document.getElementsByTagName('SCRIPT');
        for (i = 0; i < points.length; i++) {
            if (points.item(i).type && points.item(i).type === 'WaveDrom') { // if it is WaveJSON
                points.item(i).setAttribute('id', 'InputJSON_' + index);

                node0 = document.createElement('div');
                //			node0.className += 'WaveDrom_Display_' + index;
                node0.id = 'WaveDrom_Display_' + index;
                points.item(i).parentNode.insertBefore(node0, points.item(i)); // insert node0 before the script tag
                //			WaveDrom.InsertSVGTemplate(i, node0);
                index += 1;
            }
        }

        // second pass
        for (i = 0; i < index; i += 1) {
            //eva: takes the div with id InputJSON_[INDEX], performs sematics/syntax checks and returns the parsed JSON as an object
            //renderWaveForm:
            renderWaveForm(i, eva('InputJSON_' + i), 'WaveDrom_Display_');
            WaveDrom.appendSaveAsDialog(i, 'WaveDrom_Display_');
        }
        // add styles
        document.head.innerHTML += '<style type="text/css">div.wavedromMenu{position:fixed;border:solid 1pt#CCCCCC;background-color:white;box-shadow:0px 10px 20px #808080;cursor:default;margin:0px;padding:0px;}div.wavedromMenu>ul{margin:0px;padding:0px;}div.wavedromMenu>ul>li{padding:2px 10px;list-style:none;}div.wavedromMenu>ul>li:hover{background-color:#b5d5ff;}</style>';
    }

    function editorRefresh () {
        // var svg,
        // 	ser,
        // 	ssvg,
        // 	asvg,
        // 	sjson,
        // 	ajson;

        renderWaveForm(0, eva('InputJSON_0'), 'WaveDrom_Display_');

        /*
        svg = document.getElementById('svgcontent_0');
        ser = new XMLSerializer();
        ssvg = '<?xml version='1.0' standalone='no'?>\n' +
        '<!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'>\n' +
        '<!-- Created with WaveDrom -->\n' +
        ser.serializeToString(svg);

        asvg = document.getElementById('download_svg');
        asvg.href = 'data:image/svg+xml;base64,' + window.btoa(ssvg);

        sjson = localStorage.waveform;
        ajson = document.getElementById('download_json');
        ajson.href = 'data:text/json;base64,' + window.btoa(sjson);
        */
    }

    /* Public API: */
    WaveDrom.RenderWaveForm = renderWaveForm;
    WaveDrom.ProcessAll = processAll;
    WaveDrom.EditorRefresh = editorRefresh;

})();

/* global JsonML, document, WaveSkin */
