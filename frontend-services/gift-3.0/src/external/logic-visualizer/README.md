# LogicVisualizer
A Visualizer and controller for all systems that realize a combinatorial or sequential circuit.

## Usage
First install dependencies with `npm install`

You can build a dev version with `npm start`, although I recommend that you turn on the redux devtools in store.ts and the verbose translator console output in translator.ts first.

To build the final version, use `npm run build`

### Embedding into a website

Include main.js in your html file with `<script type="module" src="path/to/dist/main.js"></script>` and use `<logic-visualizer></logic-visualizer>`
to specify where the visualizer should be. 

### Communication

Summary:  
There are five Event types used for communication:
```
'lv-initialize'
'lv-user-change'
'lv-simulator-change'
'lv-clock'
'lv-reset'
```
The first three of which use an args property:  
```
interface MachineVariable {
    name: string;
    value: string;
}

interface InitArgs {
    inputs: Array<MachineVariable>;
    states?: Array<MachineVariable>;
    outputs: Array<MachineVariable>;
    canSetState: boolean;
    hStar?: String;
}

interface UserChangeArgs {
    inputs?: Array<MachineVariable>;
    states?: Array<MachineVariable>;
}

interface SimulatorChangeArgs {
    states?: Array<MachineVariable>;
    outputs: Array<MachineVariable>;
    hStar?: string;
    answeringClock: boolean;
}
```

Here's an example:

The dispatcher functions can imported from “Events.ts”.  
The Simulator sends an Event to initialize the Visualizer:  
`dispatchInitializeVisualizerEvent( args );`  
Where the Event name is `'lv-initialize'` and  
```
args = {
    inputs: [{
        name: "x0" ,
        value: "0"
    }, { ... }, ... ],
    states: [{
        name: "a0" ,
        value: "12"
    }, { ... }, ... ],
    outputs: [{
        name: "y0" ,
        value: "1"
    }, { ... }, ... ],
    hStar: "0" ,
    canSetState: true
}
```
Then the user changes the state of a0 to 1. Again, an Event is sent:  
`dispatchUserChangeEvent( args );`  
where the Event name is `'lv-user-change'` and  
```
args = {
    states: [{
        name: "a0" ,
        value: "1"
    }]
}
```
The simulator answers with:  
`dispatchSimulatorChangeEvent( args );`  
where the name is `'lv-simulator-change'` and  
```
args = {
    outputs: [{
        name: "y0" ,
        value: "0"
    }, { ... }, ... ],
    hStar: "1" ,
    answeringClock: false
}
```
Alternatively, the Events can also be created manually (to avoid accessing Events.ts):  
```
let args = {
    outputs: [{
        name: "y0" ,
        value: "0"
    }, { ... }, ... ],
    hStar: "1" ,
    answeringClock: false
};
let event = new CustomEvent( 'lv-simulator-change' );
event[ "args" ] = args;
document.dispatchEvent(event);
```  
Then the user changes x0. In the sequential case, the Event is sent immedeately, otherwise only when pressing the calculate button.  
`dispatchUserChangeEvent( args );`  
where the Event name is `'lv-user-change'` and  
```
args = {
    inputs: [{
        name: "x0" ,
        value: "1"
    }]
}
```
The Simulator answers:  
`dispatchSimulatorChangeEvent( args );`  
where the Event name is `'lv-simulator-change'` and  
```
args = {
    outputs: [{
        name: "y0" ,
        value: "0"
    }, { ... }, ... ],
    hStar: "0" ,
    answeringClock: false
}
``` 
Next, the user clicks the clock button:  
`dispatchClockEvent();`  
where the Event name is `lv-clock`.  
The Simulator answers:    
`dispatchSimulatorChangeEvent( args );`  
where the Event name is `'lv-simulator-change'` and  
```
args = {
    states: [{
        name: "a0" ,
        value: "1"
    }, { ... }, ... ],
    outputs: [{
        name: "y0" ,
        value: "0"
    }, { ... }, ... ],
    hStar: "0" ,
    answeringClock: true
}
```
Then the user resets:
`dispatchResetEvent();`  
where the Event name is `lv-reset`.

###Values

The values sent for inputs are `"0"` and `"1"`.  
The default values to send for outputs would be `"0"` or `"1"` and for states it would be the state number
as a string.  
You can however send any string for the state, e.g. `"idle state"` would be fine, but be careful with longer
state names as they will lead to problems when zoomed out too far (if they are longer than fits in a single clock).  
For outputs, all values that WaveDrom naturally supports are theoretically possible should you wish to use them:

!["image](./WaveDrom%20values.png)

You can see that they also have transitions. Repeatedly sending the same character will however not cause them to appear.
This is because repeated values are saved as `"."` which extends the current character without making a transition appear.

For the h*-highlighting:  
`"0"` = no highlighting  
`"1"` = inputs highlighted, h*(x)  
`"2"` = states highlighted, h*(z)  
`"3"` = both highlighted, h*(x, z)

For completeness, here also the explanation for vLines values:  
vLines stores values from `"0000"` to `"1111"` (binary) for the possible combinations of lines 
in one clock. Each bit indicates whether there is a line at one of the four possible positions: 
clock start, first quarter, half, third quarter. E.g. `"1001"` = lines at clock start and third quarter


#Adding a translation

<ol>
<li>
Duplicate a folder under src/app/locales/.
</li>
<li>
Rename it to the abbreviation of the language you're adding.
</li>
<li>
Edit defaultNS.json replacing the value part (right side) of each line with the translated version.
</li>
<li>
Add your language abbreviation to the fallbackLng Array in translator.ts.
</li>
<li>
Your language can now be selected in the language menu.
</li>
</ol>