import JsonML from "./JsonML";
import {WaveDromGroup} from "../model/WaveDromSource";
import WaveSkin from "./WaveDromSkin";

let waveSkin = {default: WaveSkin};

// In hindsight, it would have been better to write my own renderer instead of using WaveDrom. It is a lot easier than I thought, paths work basically like gcode.
// Should development continue on this project, I recommend you do this. Here some ideas:
//      Instead of using bricks, use one path for a single clock where you set d with a template string and calculate the positions in it with hscale or something similar (could even make it continuous then)
//      You could even continue to clone these with the <use> elements but I don't see why that would be necessary.
//      I would definitely also recommend to abolish the use of the "."s. It just makes everything more complicated.
//      You could probably make it work to make the highlighting into a transparent colored region that goes over the lanes instead of having to color the state extra (although that would also probably not be that hard when building it from the ground up).
//      Then you could even add vertical zooming as well: Scroll = vertical scroll, Shift+Scroll = horizontal scroll, Ctrl+Scroll = vertical zoom, Ctrl+Shift+Scroll = horizontal zoom. (that would be the natural implementation imo, but it might make sense to swap the last two because horizontal zooming is more important and therefor should be easier to use)

let lane = {
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
    head   : {
        text: undefined
    },
    foot   : {
        text: undefined
    },
    hscale : 1,
    hscale0: undefined,
    period: undefined,
    phase: undefined
};

let parse = JsonML.parse;

let prevLaneElements = []; // save the lane Elements so there is less processing required
let prevRenderedBricks = []; // save the number of bricks we already rendered

// source: parsed WaveJSON object, output: id of div that will hold the svg, domain: domain of the searches for elements (used to be document, will now be the shadow dom)
export function renderWaveForm (source, output: string, domain, fullRedraw: boolean) {

    let index = 0; // LV only needs one SVG
    var ret,
        root, groups, svgcontent, content, width, height,
        glengths, xmax = 0, i;

    if(fullRedraw) {
        prevLaneElements = [];
        prevRenderedBricks = [];
    }

    if (source.signal) {
        insertSVGTemplate(index, domain.getElementById(output + index), source);
        parseConfig(source);
        ret = rec(source.signal, {'x':0, 'y':0, 'xmax':0, 'width':[], 'lanes':[], 'groups':[]}); // ret is now the source.signal information in the format of the state object (i.e. 2nd argument here)
        root          = domain.getElementById('lanes_' + index);
        groups        = domain.getElementById('groups_' + index);
        // original line: content  = parseWaveLanes(ret.lanes, lane);
        content  = parseWaveLanes(ret.lanes); // content is now a list of lanes [ [ [name, phase], listOfInstructionStrings : null, listOfDataStrings : null], ...] TODO could add speedup like for rendering

        let numberOfInputs = 0;
        if(source.indexMap.inputs !== undefined) {
            numberOfInputs = source.signal[source.indexMap.inputs].length-1; // one of the elements is just the name of the group
            if(source.indexMap.states !== undefined) {
                numberOfInputs += 1.5; // if there are states, there is a clock and a whitespace. The .5 is to indicate a clock.
            }
        }
        glengths = renderWaveLane(root, content, index, source.hStar, numberOfInputs, fullRedraw);
        for (i in glengths) {
            xmax = Math.max(xmax, (glengths[i] + ret.width[i]));
        }
        renderVLines(root, source.vLines, content.length);
        renderMarks(root, content, index);
        renderArcs(root, ret.lanes, index, source);
        renderGaps(root, ret.lanes, index);
        renderGroups(groups, ret.groups, index);
        lane.xg = Math.ceil((xmax - lane.tgo) / lane.xs) * lane.xs;
        width  = (lane.xg + (lane.xs * (lane.xmax + 1)));
        height = (content.length * lane.yo +
            lane.yh0 + lane.yh1 + lane.yf0 + lane.yf1);

        svgcontent = domain.getElementById('svgcontent_' + index);
        svgcontent.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
        svgcontent.setAttribute('width', width);
        svgcontent.setAttribute('height', height);
        svgcontent.setAttribute('overflow', 'hidden');
        root.setAttribute('transform', 'translate(' + (lane.xg + 0.5) + ', ' + ((lane.yh0 + lane.yh1) + 0.5) + ')');
    } else if (source.assign) {
        // original line: insertSVGTemplateAssign(index, document.getElementById(output + index), source);
        insertSVGTemplateAssign(index, domain.getElementById(output + index));
        renderAssign(index, source, domain);
    }
}

function renderVLines(root, vLines, laneCount) {
    let group = parse([
        'g',
        {
            id: 'vLines'
        }
    ]);
    vLines.forEach((clockEntry, index) => {
        if(clockEntry !== '0000') {
            clockEntry.split('').forEach((subEntry, subIndex) => {
                if(subEntry === '1') {
                    let offset = (index-1)*40*lane.hscale+20*lane.hscale+subIndex*10*lane.hscale;
                    let path = parse([
                        'path',
                        {
                            d: `m0,0 0,${laneCount*lane.yo}`,
                            style: 'fill: none; stroke: #00f; stroke-width: 2; stroke-linecap: round; stroke-opacity: 1;',
                            transform: `translate(${offset})`
                        }
                    ]);
                    group.insertBefore(path, null);
                }
            });
        }
    });
    root.insertBefore(group, null);
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

function parseConfig (source) {
    var hscale;

    function tonumber (x) {
        return x > 0 ? Math.round(x) : 1;
    }

    lane.hscale = 1;
    if (lane.hscale0 !== undefined) {
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

// state: {'x':0, 'y':0, 'xmax':0, 'width':[], 'lanes':[], 'groups':[]} (initially)
function rec (tmp, state) { // tmp = source.signal (initially)
    var i, name, old = {
        y: undefined
    }, delta = {'x':10};
    if (typeof tmp[0] === 'string' || typeof tmp[0] === 'number') {
        name = tmp[0];
        delta.x = 25;
    }
    state.x += delta.x;
    for (i = 0; i < tmp.length; i++) {
        if (typeof tmp[i] === 'object') {
            /*if (Object.prototype.toString.call(tmp[i]) === '[object Array]') {
                old.y = state.y;
                state = rec(tmp[i], state);
                state.groups.push({'x':state.xx, 'y':old.y, 'height':(state.y - old.y), 'name':state.name});
            } else {
                state.lanes.push(tmp[i]);
                state.width.push(state.x);
                state.y += 1;
            }*/
            if(tmp[i] instanceof WaveDromGroup){
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

// lanes: a list of WaveDromLane objects
function parseWaveLanes (lanes) {

    function data_extract (e) {
        var tmp = e.data;
        if (tmp === undefined) { return null; }
        if (typeof (tmp) === 'string') { return tmp.split(' '); }
        return tmp;
    }

    var x,              // index, iterates over signal (i.e. list)
        laneWJ,         // a WaveDromLane object
        content = [],   // the object that is returned: [ [tmp0, listOfInstructionStrings : null, listOfDataStrings : null], ...]
        tmp0 = [];      // [name, phase]

    for (x in lanes) {
        laneWJ = lanes[x];
        lane.period = laneWJ.period ? laneWJ.period    : 1;
        lane.phase  = laneWJ.phase  ? laneWJ.phase * 2 : 0;
        content.push([]);
        tmp0[0] = laneWJ.name  || ' ';
        tmp0[1] = laneWJ.phase || 0;
        content[content.length - 1][0] = tmp0.slice(0); // making a copy
        // original line: content[content.length - 1][1] = sigx.wave ? parseWaveLane(sigx.wave, lane.period * lane.hscale - 1, lane) : null;
        content[content.length - 1][1] = laneWJ.wave ? parseWaveLane(laneWJ.wave, lane.period * lane.hscale - 1) : null;
        content[content.length - 1][2] = data_extract(laneWJ);
    }
    return content;
}

// root:    HTML element with id 'lanes_'+INDEX
// content: a list of lanes in the format: [ [ [name, phase], listOfInstructionStrings : null, listOfDataStrings : null], ...]
// index:   Always 0 for LV
// hStar:   For LV. The h*-Information.
// numberOfInputs: For LV. The number of input lanes for highlighting.
function renderWaveLane (root, content, index, hStar, numberOfInputs, fullRedraw: boolean) {
    var i,
        j,              // index iterates over content
        k,
        g,
        gg,
        title,
        brick,
        labels = [1],
        name,

        xmax     = 0,
        xgmax    = 0,
        glengths = [],
        svgns    = 'http://www.w3.org/2000/svg',
        xlinkns  = 'http://www.w3.org/1999/xlink',
        xmlns    = 'http://www.w3.org/XML/1998/namespace';

    //TODO (not important) make it so the first clock is not doubled up. Currently, the bricks for the first clock are there twice.
    for (j = 0; j < content.length; j += 1) {
        if(prevRenderedBricks[j] === undefined) {
            prevRenderedBricks[j] = 0;
        }
        name = content[j][0][0]; // name of the lane
        if (name) { // check name
            g = parse([
                'g',
                {
                    id: 'wavelane_' + j + '_' + index,
                    transform: 'translate(0,' + ((lane.y0) + j * lane.yo) + ')'
                }
            ]); // parse creates DOM Element
            root.insertBefore(g, null);
            //original line: if (typeof name === 'number') { name += ''; }
            if (typeof name === 'number') { name = String(name); }
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
            xoffset = (xoffset > 0) ? (Math.ceil(2 * xoffset) - 2 * xoffset) : (-2 * xoffset);
            if(fullRedraw) {
                gg = parse([
                    'g',
                    {
                        id: 'wavelane_draw_' + j + '_' + index,
                        transform: 'translate(' + (xoffset * lane.xs) + ', 0)'
                    }
                ]);
                prevLaneElements[j] = parse([
                    'g',
                    {
                        id: 'wavelane_draw_' + j + '_' + index,
                        transform: 'translate(' + (xoffset * lane.xs) + ', 0)'
                    }
                ]);
            } else {
                gg = prevLaneElements[j];
            }
            g.insertBefore(gg, null);

            if (content[j][1]) {
                i=0;
                let textLabel; // we need to move it to the end because the "line" is redrawn but the label isn't so it would get covered up otherwise.
                if(!fullRedraw) {
                    i = prevRenderedBricks[j]; // start drawing after the point where the saved stuff ends
                    textLabel = gg.childNodes[gg.childElementCount-1]; // the textLabel is always the last child of the lane since the labels are added after the rest is already done.
                }

                for (; i < content[j][1].length; i += 1) {

                    if(i === content[j][1].length - 4*lane.hscale) { // always save everything except the last two clocks (= 1 LV clock)
                        prevRenderedBricks[j] = i;
                        if(!fullRedraw) {
                            gg.insertBefore(textLabel, null);
                        }
                        prevLaneElements[j] = gg.cloneNode(true);
                    }

                    // content[j][1][i] is the brick (instruction string) that is translated into a use element
                    // a brick is half a WaveDrom-clock which is half of an LV-clock
                    brick    = document.createElementNS(svgns, 'use'); // every use element is a lane-part for half of a clock
                    // b.id = 'use_' + i + '_' + j + '_' + index;
                    let currentHstar = Number(hStar[Math.floor(i/(2*lane.hscale))]);
                    let brickID = content[j][1][i];
                    if(currentHstar > 1 && (brickID === 'vvv-2' || brickID === 'vmv-2-2')) {
                        if(brickID === 'vvv-2') {
                            brickID = 'vvv-4'; // highlight inside of state
                        } else {
                            if(currentHstar > 1) {
                                brickID = 'vmv-4-4'; // last clock was also highlighted
                            } else {
                                brickID = 'vmv-2-4'; // last clock wasn't highlighted
                            }
                        }
                    }
                    brick.setAttributeNS(xlinkns, 'xlink:href', '#' + brickID);

                    // b.setAttribute('transform', 'translate(' + (i * lane.xs) + ')');
                    brick.setAttribute('transform', 'translate(' + (i * lane.xs) + ')');

                    if((currentHstar > 1 && (brickID === 'vvv-4' || brickID === 'vmv-2-4' || brickID === 'vmv-4-4'))
                            || ((currentHstar % 2 === 1) && j < numberOfInputs
                                && (numberOfInputs % 1 === 0 || j !== 0))) {
                        // if (h*(z) AND brick is state brick) OR (h*(x) AND lane is input and (lane is not clock OR there is no clock)) then highlight
                        let highlight = document.createElementNS(svgns, 'use');
                        highlight.setAttributeNS(xlinkns, 'xlink:href', '#lv-highlight');
                        highlight.setAttribute('transform', 'translate(' + (i * lane.xs) + ')');
                        gg.insertBefore(highlight, null);
                    }

                    gg.insertBefore(brick, null);
                    if(prevRenderedBricks[j] === 0) { // so we can attach the text label to prevLaneElements[j] directly (below)
                        prevLaneElements[j] = gg.cloneNode(true);
                    }
                }




                if (content[j][2] && content[j][2].length) { // text labels

                    let firstIndexToSearch=0;
                    if(!fullRedraw) {
                        firstIndexToSearch = prevRenderedBricks[j]; // previous labels are already there
                    }

                    labels = findLaneMarkers(content[j][1], firstIndexToSearch);

                    if (labels.length !== 0) {
                        let offset = 0; // so we select the correct label
                        if(!fullRedraw) {
                            offset = (prevRenderedBricks[j]+(2*lane.hscale))/(4*lane.hscale);
                        }
                        for (k in labels) {
                            let contentIndex = Number(k)+offset;
                            if (content[j][2] && (typeof content[j][2][contentIndex] !== 'undefined')) {
                                let diagramText;
                                if(typeof content[j][2][contentIndex] === 'number'){
                                    diagramText = String(content[j][2][contentIndex]);
                                } else {
                                    diagramText = content[j][2][contentIndex];
                                }
                                title = parse([
                                    'text',
                                    {
                                        x: labels[k] * lane.xs + lane.xlabel,
                                        y: lane.ym,
                                        'text-anchor': 'middle'
                                    },
                                    diagramText // + '')
                                ]);
                                title.setAttributeNS(xmlns, 'xml:space', 'preserve');
                                gg.insertBefore(title, null);
                                prevLaneElements[j].insertBefore(title.cloneNode(true), null); // so the save version also has the new label
                            }
                        }
                    }
                }
                if (content[j][1].length > xmax) {
                    xmax = content[j][1].length;
                }
            }
        }

        if(j === Math.ceil(numberOfInputs)) { // connect highlighting for h*(x,z)

            g = parse([
                'g',
                {
                    id: 'wavelane_' + j + '_' + index,
                    transform: 'translate(0,' + ((lane.y0) + j * lane.yo) + ')'
                }
            ]); // parse creates DOM Element
            root.insertBefore(g, null);

            gg = parse([
                'g',
                {
                    id: 'wavelane_draw_' + j + '_' + index,
                    transform: 'translate(' + (xoffset * lane.xs) + ', 0)'
                }
            ]);
            g.insertBefore(gg, null);

            hStar.forEach((instructionChar, i) => {
                if(instructionChar === '3') {
                    for(let highlightCounter = 0; highlightCounter < 2*lane.hscale; highlightCounter++) {
                        let highlight = document.createElementNS(svgns, 'use');
                        highlight.setAttributeNS(xlinkns, 'xlink:href', '#lv-highlight');
                        highlight.setAttribute('transform', 'translate(' + ((i * 2 * lane.hscale + highlightCounter) * lane.xs) + ')');
                        gg.insertBefore(highlight, null);
                    }
                }
            });
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
            // original line: if (typeof tmp === 'number') { tmp += ''; }
            if (typeof tmp === 'number') { tmp = String(tmp); }
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

    /* redundant function: function t1 () {
        gmark = document.createElementNS(svgns, 'path');
        gmark.id = ('gmark_' + Edge.from + '_' + Edge.to);
        gmark.setAttribute('d', 'M ' + from.x + ',' + from.y + ' ' + to.x   + ',' + to.y);
        gmark.setAttribute('style', 'fill:none;stroke:#00F;stroke-width:1');
        gg.insertBefore(gmark, null);
    } only used once*/

    if (source) {
        for (i in source) {
            lane.period = source[i].period ? source[i].period    : 1;
            lane.phase  = source[i].phase  ? source[i].phase * 2 : 0;
            text = source[i].node;
            if (text) {
                if(typeof text === 'string'){
                    Stack = text.split('');
                } else {
                    Stack = text;
                }
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

                gmark = document.createElementNS(svgns, 'path');
                gmark.id = ('gmark_' + Edge.from + '_' + Edge.to);
                gmark.setAttribute('d', 'M ' + from.x + ',' + from.y + ' ' + to.x   + ',' + to.y);
                gmark.setAttribute('style', 'fill:none;stroke:#00F;stroke-width:1');
                gg.insertBefore(gmark, null);

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

                if(typeof text === 'string'){
                    Stack = text.split('');
                } else {
                    Stack = text;
                }

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
            // original line: if (typeof name === 'number') { name += ''; }
            if (typeof name === 'number') { name = String(name); }
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

function renderAssign (index, source, domain) {

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
            ret = [],
            ys = [],
            ymin,
            ymax,
            ilen = spec.length;

        ret.push('g');

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
        var ret = [], i, ilen, fx, fy, fname, spec = [];
        ret.push('g');
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

    var tree, state, xmax, svg = [], grid = [], svgcontent, width, height, i, ilen, j, jlen;
    svg.push('g');
    grid.push('g');
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
    svgcontent = domain.getElementById('svgcontent_' + index);
    svgcontent.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    svgcontent.setAttribute('width', width);
    svgcontent.setAttribute('height', height);
    svgcontent.insertBefore(JsonML.parse(['g', {transform:'translate(0.5, 0.5)'}, grid, svg]), null);
}

// parseWaveLane turns the wave string (or list) from the WaveJSON into a list of instruction strings
// wave: the wave string
// extra: period * hscale - 1, standard: 0
function parseWaveLane (wave, extra) {
    // We take the top off the stack and work it
    var Repeats = 1,            // counts how many repeats there are i.e. 1 for the original instruction character and one for each '.' after that
        Top,                    // the previous "Next"
        Next,                   // the part of the stack that is currently being worked on
        Stack = [],             // each element is a symbol that says what should be displayed in that clock. Stack[0] is top of stack.
        returnValue = [],       // the object that is returned: []
        i;

    if(typeof wave === 'string'){
        Stack = wave.split('');
    } else {
        Stack = wave;
    }

    Next  = Stack.shift();

    while (Stack[0] === '.' || Stack[0] === '|') { // repeaters parser
        Stack.shift();
        Repeats += 1;
    }
    returnValue = returnValue.concat(genFirstWaveBrick(Next, extra, Repeats)); // returnValue is now a list of instruction strings

    while (Stack.length) {
        Top = Next;
        Next = Stack.shift();
        Repeats = 1;
        while (Stack[0] === '.' || Stack[0] === '|') { // repeaters parser
            Stack.shift();
            Repeats += 1;
        }
        returnValue = returnValue.concat(genWaveBrick((Top + Next), extra, Repeats)); // returnValue is now an even longer list of instruction strings
    }
    for (i = 0; i < lane.phase; i += 1) {
        returnValue.shift();
    }
    return returnValue;
}

// returns an array with number of bricks until the label
function findLaneMarkers (bricKIDs, firstIndexToSearch) {
    var i = firstIndexToSearch, gcount = firstIndexToSearch, lcount = 0, ret = [];

    for (; i < bricKIDs.length; i++) {

        // original line: if (lanetext[i] === 'vvv-2' | lanetext[i] === 'vvv-3' | lanetext[i] === 'vvv-4' | lanetext[i] === 'vvv-5') {
        if (bricKIDs[i] === 'vvv-2' || bricKIDs[i] === 'vvv-3' || bricKIDs[i] === 'vvv-4' || bricKIDs[i] === 'vvv-5') {
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

// genFirstWaveBrick translates the single character instruction and the number of repeats into a list of instruction strings
// instructionChar: the symbol that dictates what is to be drawn
// extra: period * hscale - 1, standard: 0
// times: the number of instances the same thing is drawn
function genFirstWaveBrick (instructionChar, extra, times) {
    var returnValue = []; //

    if(typeof instructionChar === 'number'){
        instructionChar = String(instructionChar);
    }
    switch (instructionChar) {
        case 'p': returnValue = genBrick(['pclk', '111', 'nclk', '000'], extra, times); break;
        case 'n': returnValue = genBrick(['nclk', '000', 'pclk', '111'], extra, times); break;
        case 'P': returnValue = genBrick(['Pclk', '111', 'nclk', '000'], extra, times); break;
        case 'N': returnValue = genBrick(['Nclk', '000', 'pclk', '111'], extra, times); break;
        case 'l':
        case 'L':
        case '0': returnValue = genBrick(['000'], extra, times); break;
        case 'h':
        case 'H':
        case '1': returnValue = genBrick(['111'], extra, times); break;
        case '=': returnValue = genBrick(['vvv-2'], extra, times); break;
        case '2': returnValue = genBrick(['vvv-2'], extra, times); break;
        case '3': returnValue = genBrick(['vvv-3'], extra, times); break;
        case '4': returnValue = genBrick(['vvv-4'], extra, times); break;
        case '5': returnValue = genBrick(['vvv-5'], extra, times); break;
        case 'd': returnValue = genBrick(['ddd'], extra, times); break;
        case 'u': returnValue = genBrick(['uuu'], extra, times); break;
        case 'z': returnValue = genBrick(['zzz'], extra, times); break;
        default:  returnValue = genBrick(['xxx'], extra, times); break;
    }
    return returnValue;
}

// genWaveBrick translates the single character instructions and the number of repeats into a list of instruction strings
// text: a 2-char string, the previous and the current instruction char in that order
// extra: period * hscale - 1, standard: 0
// times: the number of instances the same thing is drawn
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

    //.log("textsplit1089", text);
    if(typeof text === 'string'){
        atext = text.split('');
    } else {
        atext = text;
    }
    //if (atext.length !== 2) { return genBrick(['xxx'], extra, times); }

    // atext = [lastInstruction, currentInstruction]
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
            return genBrick([tmp3 + 'm' + tmp2 + y2[atext[0]] + x3[atext[1]], tmp0], extra, times); // a '2' after a '2' in the waveJSON results in: [vmv-2-2, vvv-2]
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

// genBrick generates a list of instruction strings
// texts: list of instruction texts (multiple chars)
// extra: period * hscale - 1, standard: 0
// times: the number of instances the same thing is to be drawn
function genBrick (texts, extra, times) {
    var i,                  // iterates over extra and one other thing
        j,                  // iterates over times
        returnValue = [];   // []

    if (texts.length === 4) {
        for (j = 0; j < times; j += 1) {

            returnValue.push(texts[0]);

            for (i = 0; i < extra; i += 1) { // in standard case runs 0 times
                returnValue.push(texts[1]);
            }

            returnValue.push(texts[2]);

            for (i = 0; i < extra; i += 1) { // in standard case runs 0 times
                returnValue.push(texts[3]);
            }
        }
        return returnValue;
    }

    if (texts.length === 1) {
        texts.push(texts[0]);
    }

    returnValue.push(texts[0]);

    for (i = 0; i < (times * (2 * (extra + 1)) - 1); i += 1) {
        returnValue.push(texts[1]);
    }

    return returnValue;
}