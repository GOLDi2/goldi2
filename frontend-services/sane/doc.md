## Modules

<dl>
<dt><a href="#module_Boollib function library">Boollib function library</a></dt>
<dd></dd>
<dt><a href="#module_Eventlib function library">Eventlib function library</a></dt>
<dd></dd>
<dt><a href="#module_Validationlib Function Library">Validationlib Function Library</a></dt>
<dd></dd>
</dl>

## Classes

<dl>
<dt><a href="#SaneData">SaneData</a></dt>
<dd><p>Class for SaneData.</p></dd>
<dt><a href="#SaneExpression">SaneExpression</a></dt>
<dd><p>Class to display the minimized expressions.</p></dd>
<dt><a href="#SaneFunctionHasard">SaneFunctionHasard</a></dt>
<dd><p>Class for the function hasard view</p></dd>
<dt><a href="#SaneNotification">SaneNotification</a></dt>
<dd><p>Class for the notification-system in Sane.</p></dd>
<dt><a href="#SaneQmcTable">SaneQmcTable</a></dt>
<dd><p>Class for the qmc table view.</p></dd>
<dt><a href="#SaneSettings">SaneSettings</a></dt>
<dd><p>Implements the settings element of sane.</p></dd>
<dt><a href="#SaneTruthTable">SaneTruthTable</a></dt>
<dd><p>Class for the truth-table view.</p></dd>
<dt><a href="#SaneVennDiagramSvg">SaneVennDiagramSvg</a></dt>
<dd><p>Class for drawing and adding functions to diagram.</p></dd>
<dt><a href="#SaneVennDiagram">SaneVennDiagram</a></dt>
<dd><p>Class for calculating the venn diagram.</p></dd>
</dl>

## Mixins

<dl>
<dt><a href="#SaneMath">SaneMath</a> ⇒</dt>
<dd><p>Mixin to allow typesetting math via MathJax.</p></dd>
</dl>

## Members

<dl>
<dt><a href="#left">left</a></dt>
<dd><p>Provides the information on which side the view will be opened.</p></dd>
<dt><a href="#page">page</a></dt>
<dd><p>Contains the name of last clicked view.</p></dd>
<dt><a href="#pageLeft">pageLeft</a></dt>
<dd><p>Contains the name of left view.</p></dd>
<dt><a href="#pageRight">pageRight</a></dt>
<dd><p>Contains the name of right view.</p></dd>
<dt><a href="#reload">reload</a></dt>
<dd><p>Reload of side?</p></dd>
<dt><a href="#routeData">routeData</a></dt>
<dd><p>Contains data of the app-route element.</p></dd>
<dt><a href="#shortNames">shortNames</a></dt>
<dd><p>Show short names?</p></dd>
<dt><a href="#wideLayout">wideLayout</a></dt>
<dd><p>Show wide layout?</p></dd>
</dl>

## Constants

<dl>
<dt><a href="#saneAppLocalizeBehaviorBase">saneAppLocalizeBehaviorBase</a></dt>
<dd><p>Base class of AppLocalizeBehavior.</p></dd>
<dt><a href="#qmclibCache">qmclibCache</a></dt>
<dd><p>The qmclib cache.
Is initialized with empty results and fixed size 7 (max output columns).</p></dd>
</dl>

## Functions

<dl>
<dt><a href="#AppLocalizeMixin">AppLocalizeMixin()</a> ⇒ <code>class</code></dt>
<dd><p>Like a Mixin which returns Polymer.Element extended with AppLocalizeBehavior and localizeSane.</p></dd>
<dt><a href="#getExpressionAsTerms">getExpressionAsTerms(data, expType, index)</a> ⇒ <code>string</code></dt>
<dd><p>Compute the data of a y-function to the required expression - as a string.</p></dd>
<dt><a href="#getExpressionAsExpTrees">getExpressionAsExpTrees(data, expType, index)</a> ⇒ <code>any</code></dt>
<dd><p>Compute the data of a y-function to the required expression - as an expTree.</p></dd>
<dt><a href="#makeStringFromExpTree">makeStringFromExpTree(expTree, chars)</a> ⇒ <code>string</code></dt>
<dd><p>Parses the expTree into a string.</p></dd>
<dt><a href="#makeLaTeXFromExpTree">makeLaTeXFromExpTree(expTree, data)</a> ⇒ <code>string</code></dt>
<dd><p>Parses the expTree into a LaTeX math formula.</p></dd>
<dt><a href="#getFunctionIndexFromTree">getFunctionIndexFromTree(expTree, data)</a> ⇒ <code>number</code></dt>
<dd><p>Compute a function index from a expression tree object.</p></dd>
<dt><a href="#getVariablesFromTree">getVariablesFromTree(expTree)</a> ⇒ <code>Array.&lt;number&gt;</code> | <code>number</code></dt>
<dd><p>Helper function for 'getFunctionIndexFromTree'. Fetches all x variables in the expression tree.</p></dd>
<dt><a href="#calcValueForAssignment">calcValueForAssignment(expTree, assignment)</a> ⇒ <code>boolean</code></dt>
<dd><p>Helper function for 'getFunctionIndexFromTree'.
Fetch the true/false row assignment for the expression tree.</p></dd>
<dt><a href="#getMinimalTerms">getMinimalTerms(data, index, minType)</a> ⇒ <code>any</code></dt>
<dd><p>The main function for the minimization process of a y-function.
Uses helper functions to calculate steps and manages the return values.</p></dd>
<dt><a href="#getPrimeImplicants">getPrimeImplicants(data, index, type)</a> ⇒ <code>Array.&lt;IPrimeImplicant&gt;</code></dt>
<dd><p>Helper function for 'getMinimalTerms'.
Compute an array of minimization sub-steps with indices in the form presented in the lectures and materials.</p></dd>
<dt><a href="#getT0Implicants">getT0Implicants(nrXVars)</a> ⇒ <code>Array.&lt;IPrimeImplicant&gt;</code></dt>
<dd><p>Helper function for 'getPrimeImplicants'.
Build groups with all (possible) unfiltered indices.</p></dd>
<dt><a href="#getInitialIndices">getInitialIndices(data, index, type)</a> ⇒ <code>Array.&lt;string&gt;</code></dt>
<dd><p>Helper function for 'getPrimeImplicants'.
Fetch all inidces where y_n = value or h* is true. Value depends on type.</p></dd>
<dt><a href="#getMinTable">getMinTable(step)</a> ⇒ <code>IMinTable</code></dt>
<dd><p>Helper function for 'getMinimalTerms'.
Build an object representing the prime implicant selection table.</p></dd>
<dt><a href="#solveMinTable">solveMinTable(step)</a> ⇒ <code>IMinTable</code></dt>
<dd><p>Helper function for 'getMinimalTerms'.
Calculate a solution for the given selection table.</p></dd>
<dt><a href="#applyArrayShortening">applyArrayShortening(arr)</a> ⇒ <code>Array.&lt;Array.&lt;number&gt;&gt;</code></dt>
<dd><p>Helper function for 'solveMinTable'.
Shorten the array by applying 'XX=X', 'X+X=X' and 'X+XY=X'.</p></dd>
<dt><a href="#makeTreesFromMin">makeTreesFromMin(mintable, type)</a> ⇒ <code>any</code></dt>
<dd><p>Helper function for 'getMinimalTerms'.
Compute an expression tree for the given solution of the selection table.</p></dd>
<dt><a href="#typeset">typeset(node, formula)</a></dt>
<dd><p>Renders the string formula that has to be LaTeX to the textContent of the element node as math.</p></dd>
<dt><a href="#setStartConfig">setStartConfig(uri)</a></dt>
<dd><p>Set a new global start configuration.</p></dd>
<dt><a href="#checkSCData">checkSCData()</a> ⇒ <code>any</code> | <code>undefined</code></dt>
<dd><p>Check if a SaneData object exists in the start configuration.</p></dd>
<dt><a href="#checkSCViews">checkSCViews()</a> ⇒ <code>object</code> | <code>undefined</code></dt>
<dd><p>Check if there is information about the default views in the start configuration.</p></dd>
<dt><a href="#checkSCBlockedFeatures">checkSCBlockedFeatures(blockedFeatureView, feature)</a> ⇒ <code>any</code></dt>
<dd><p>Check if any feature of the blocked features exists in the start configuration.</p></dd>
</dl>

<a name="module_Boollib function library"></a>

## Boollib function library

* [Boollib function library](#module_Boollib function library)
    * [~valueToInt(v)](#module_Boollib function library..valueToInt) ⇒ <code>number</code>
    * [~bitWidth(num)](#module_Boollib function library..bitWidth) ⇒ <code>number</code>
    * [~maxValue(data)](#module_Boollib function library..maxValue) ⇒ <code>number</code>
    * [~getBitGParam(value, index)](#module_Boollib function library..getBitGParam) ⇒ <code>number</code> \| <code>&quot;?&quot;</code>
    * [~getBit(value, index)](#module_Boollib function library..getBit) ⇒ <code>number</code> \| <code>&quot;?&quot;</code>
    * [~hex2bin(hex, data)](#module_Boollib function library..hex2bin) ⇒ <code>string</code>
    * [~bin2hex(bin, data)](#module_Boollib function library..bin2hex) ⇒ <code>string</code>
    * [~leftPadding(inputString, padChar, totalChars)](#module_Boollib function library..leftPadding) ⇒ <code>string</code>

<a name="module_Boollib function library..valueToInt"></a>

### Boollib function library~valueToInt(v) ⇒ <code>number</code>
<p>Turns values to Integers.</p>

**Kind**: inner method of [<code>Boollib function library</code>](#module_Boollib function library)  

| Param | Type |
| --- | --- |
| v | <code>Value</code> | 

<a name="module_Boollib function library..bitWidth"></a>

### Boollib function library~bitWidth(num) ⇒ <code>number</code>
<p>Gets bitWidth of a number.</p>

**Kind**: inner method of [<code>Boollib function library</code>](#module_Boollib function library)  

| Param | Type |
| --- | --- |
| num | <code>number</code> | 

<a name="module_Boollib function library..maxValue"></a>

### Boollib function library~maxValue(data) ⇒ <code>number</code>
<p>Safes the maximum value of the data object.</p>

**Kind**: inner method of [<code>Boollib function library</code>](#module_Boollib function library)  

| Param | Type |
| --- | --- |
| data | <code>Array.&lt;number&gt;</code> | 

<a name="module_Boollib function library..getBitGParam"></a>

### Boollib function library~getBitGParam(value, index) ⇒ <code>number</code> \| <code>&quot;?&quot;</code>
<p>Gets value of an element of the given array at specific index.</p>

**Kind**: inner method of [<code>Boollib function library</code>](#module_Boollib function library)  

| Param | Type |
| --- | --- |
| value | <code>Array.&lt;number&gt;</code> \| <code>number</code> | 
| index | <code>number</code> | 

<a name="module_Boollib function library..getBit"></a>

### Boollib function library~getBit(value, index) ⇒ <code>number</code> \| <code>&quot;?&quot;</code>
<p>Gets value of an element of the given array at specific index.</p>

**Kind**: inner method of [<code>Boollib function library</code>](#module_Boollib function library)  

| Param | Type |
| --- | --- |
| value | <code>Array.&lt;number&gt;</code> \| <code>number</code> | 
| index | <code>number</code> | 

<a name="module_Boollib function library..hex2bin"></a>

### Boollib function library~hex2bin(hex, data) ⇒ <code>string</code>
<p>Converts hexadecimal strings to binary strings.</p>

**Kind**: inner method of [<code>Boollib function library</code>](#module_Boollib function library)  

| Param | Type |
| --- | --- |
| hex | <code>string</code> | 
| data |  | 

<a name="module_Boollib function library..bin2hex"></a>

### Boollib function library~bin2hex(bin, data) ⇒ <code>string</code>
<p>Converts binary strings to hexadecimal strings.</p>

**Kind**: inner method of [<code>Boollib function library</code>](#module_Boollib function library)  

| Param | Type |
| --- | --- |
| bin | <code>string</code> | 
| data |  | 

<a name="module_Boollib function library..leftPadding"></a>

### Boollib function library~leftPadding(inputString, padChar, totalChars) ⇒ <code>string</code>
<p>Used for the hex2bin function to fill up binary numbers with 0's.</p>

**Kind**: inner method of [<code>Boollib function library</code>](#module_Boollib function library)  

| Param | Type |
| --- | --- |
| inputString | <code>string</code> | 
| padChar | <code>string</code> | 
| totalChars | <code>number</code> | 

<a name="module_Eventlib function library"></a>

## Eventlib function library

* [Eventlib function library](#module_Eventlib function library)
    * _instance_
        * [.addEvent(eventName, detail, bubbles, composed)](#module_Eventlib function library+addEvent) ⇒ <code>Event</code>
        * [.triggerEvent(eventName, detail, bubbles, composed)](#module_Eventlib function library+triggerEvent)
        * [.notifySane(message)](#module_Eventlib function library+notifySane)
    * _inner_
        * [~EventMixin](#module_Eventlib function library..EventMixin) ⇒
        * [~Events](#module_Eventlib function library..Events)

<a name="module_Eventlib function library+addEvent"></a>

### eventlib function library.addEvent(eventName, detail, bubbles, composed) ⇒ <code>Event</code>
<p>Adds a new event.</p>

**Kind**: instance method of [<code>Eventlib function library</code>](#module_Eventlib function library)  
**Returns**: <code>Event</code> - <p>Added event.</p>  

| Param | Type | Description |
| --- | --- | --- |
| eventName | <code>enum</code> | <p>The name of the event.</p> |
| detail | <code>Object</code> | <p>Event-detail object.</p> |
| bubbles | <code>boolean</code> | <p>Bubbles property.</p> |
| composed | <code>boolean</code> | <p>Composed property.</p> |

<a name="module_Eventlib function library+triggerEvent"></a>

### eventlib function library.triggerEvent(eventName, detail, bubbles, composed)
<p>Dispatches a specific event.</p>

**Kind**: instance method of [<code>Eventlib function library</code>](#module_Eventlib function library)  

| Param | Type | Description |
| --- | --- | --- |
| eventName | <code>string</code> \| <code>Event</code> | <p>Event as string or event-object.</p> |
| detail | <code>Object</code> | <p>Event-detail object.</p> |
| bubbles | <code>boolean</code> | <p>Bubbles property.</p> |
| composed | <code>boolean</code> | <p>Composed property.</p> |

<a name="module_Eventlib function library+notifySane"></a>

### eventlib function library.notifySane(message)
<p>Triggers a notification with given string as text.</p>

**Kind**: instance method of [<code>Eventlib function library</code>](#module_Eventlib function library)  
**See**: SaneNotification  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | <p>Notification message which will be shown.</p> |

<a name="module_Eventlib function library..EventMixin"></a>

### Eventlib function library~EventMixin ⇒
<p>Mixin to be able to use the custom event-system. Provides a class access to new methods.</p>

**Kind**: inner mixin of [<code>Eventlib function library</code>](#module_Eventlib function library)  
**Returns**: <p>Mixin The class which contains the new methods.</p>  
**Access**: public  
**Mixinfunction**:   

| Param | Type | Description |
| --- | --- | --- |
| base | <code>T</code> | <p>The base-class which will become the new functions.</p> |

<a name="module_Eventlib function library..Events"></a>

### Eventlib function library~Events
<p>An enumeration of used event-names.</p>

**Kind**: inner enum of [<code>Eventlib function library</code>](#module_Eventlib function library)  
**Access**: public  
<a name="module_Validationlib Function Library"></a>

## Validationlib Function Library
<a name="module_Validationlib Function Library..importSchematic"></a>

### Validationlib Function Library~importSchematic
<p>Schematic to recursively iterate over imported object.
Defines the structure and content of the imported file.</p>

**Kind**: inner constant of [<code>Validationlib Function Library</code>](#module_Validationlib Function Library)  
<a name="SaneData"></a>

## SaneData
<p>Class for SaneData.</p>

**Kind**: global class  

* [SaneData](#SaneData)
    * _instance_
        * [.reset()](#SaneData+reset)
        * [.setMask(row, value)](#SaneData+setMask) ⇒ <code>void</code>
        * [.toggleMask(row)](#SaneData+toggleMask) ⇒ <code>void</code>
        * [.incInputVariables()](#SaneData+incInputVariables) ⇒ <code>void</code>
        * [.decInputVariables()](#SaneData+decInputVariables) ⇒ <code>void</code>
        * [.incOutputVariables()](#SaneData+incOutputVariables) ⇒ <code>void</code>
        * [.decOutputVariables()](#SaneData+decOutputVariables) ⇒ <code>void</code>
        * [.toggleOutputBit(y:)](#SaneData+toggleOutputBit) ⇒ <code>void</code>
        * [.setOutputSet(x:)](#SaneData+setOutputSet) ⇒ <code>void</code>
        * [.setOutputTree(tree, index)](#SaneData+setOutputTree)
        * [.assertArguments(args)](#SaneData+assertArguments)
        * [.maxIndex(data)](#SaneData+maxIndex) ⇒ <code>number</code>
        * [.trimOutputValue(data)](#SaneData+trimOutputValue) ⇒ <code>Array.&lt;number&gt;</code>
        * [.computeMaxOutputValue(value)](#SaneData+computeMaxOutputValue) ⇒ <code>number</code>
        * [.computeNumRows()](#SaneData+computeNumRows) ⇒ <code>number</code>
        * [.fillUpOutput()](#SaneData+fillUpOutput)
        * [.computeNOutputCols(doNotify, allowShrinking)](#SaneData+computeNOutputCols) ⇒ <code>number</code>
        * [.importData(saneData)](#SaneData+importData)
        * [.setChar(customChar, char)](#SaneData+setChar)
    * _static_
        * [.defaultValue](#SaneData.defaultValue)
        * [.limits](#SaneData.limits)

<a name="SaneData+reset"></a>

### saneData.reset()
<p>Resets the data to the default values.</p>

**Kind**: instance method of [<code>SaneData</code>](#SaneData)  
<a name="SaneData+setMask"></a>

### saneData.setMask(row, value) ⇒ <code>void</code>
<p>Set h* in row to value</p>

**Kind**: instance method of [<code>SaneData</code>](#SaneData)  

| Param | Type | Default |
| --- | --- | --- |
| row | <code>number</code> |  | 
| value | <code>boolean</code> | <code>true</code> | 

<a name="SaneData+toggleMask"></a>

### saneData.toggleMask(row) ⇒ <code>void</code>
<p>Toggles the Mask.</p>

**Kind**: instance method of [<code>SaneData</code>](#SaneData)  

| Param | Type |
| --- | --- |
| row | <code>number</code> | 

<a name="SaneData+incInputVariables"></a>

### saneData.incInputVariables() ⇒ <code>void</code>
<p>Increments the input variables.</p>

**Kind**: instance method of [<code>SaneData</code>](#SaneData)  
<a name="SaneData+decInputVariables"></a>

### saneData.decInputVariables() ⇒ <code>void</code>
<p>Decrements the input variables.</p>

**Kind**: instance method of [<code>SaneData</code>](#SaneData)  
<a name="SaneData+incOutputVariables"></a>

### saneData.incOutputVariables() ⇒ <code>void</code>
<p>Increments the output variables.</p>

**Kind**: instance method of [<code>SaneData</code>](#SaneData)  
<a name="SaneData+decOutputVariables"></a>

### saneData.decOutputVariables() ⇒ <code>void</code>
<p>Decrements the output variables.</p>

**Kind**: instance method of [<code>SaneData</code>](#SaneData)  
<a name="SaneData+toggleOutputBit"></a>

### saneData.toggleOutputBit(y:) ⇒ <code>void</code>
<p>Toggles an output bit.</p>

**Kind**: instance method of [<code>SaneData</code>](#SaneData)  

| Param | Type | Description |
| --- | --- | --- |
| y: | <code>number</code> | <p>{ row: number, cell: number }</p> |

<a name="SaneData+setOutputSet"></a>

### saneData.setOutputSet(x:) ⇒ <code>void</code>
<p>Sets a new output set from the user input.</p>

**Kind**: instance method of [<code>SaneData</code>](#SaneData)  

| Param | Type | Description |
| --- | --- | --- |
| x: | <code>number</code> | <p>{ index: number, set: string}</p> |

<a name="SaneData+setOutputTree"></a>

### saneData.setOutputTree(tree, index)
<p>Sets a new output function from the user input.</p>

**Kind**: instance method of [<code>SaneData</code>](#SaneData)  

| Param | Type | Description |
| --- | --- | --- |
| tree | <code>expressionTree</code> |  |
| index | <code>number</code> | <p>output variable index</p> |

<a name="SaneData+assertArguments"></a>

### saneData.assertArguments(args)
<p>Checks if rowIndex and outputBitIndex are within the datarange.</p>

**Kind**: instance method of [<code>SaneData</code>](#SaneData)  

| Param | Type |
| --- | --- |
| args | <code>number</code> | 

<a name="SaneData+maxIndex"></a>

### saneData.maxIndex(data) ⇒ <code>number</code>
<p>Calculates the max index of the current data.</p>

**Kind**: instance method of [<code>SaneData</code>](#SaneData)  

| Param | Type |
| --- | --- |
| data | <code>Array.&lt;number&gt;</code> | 

<a name="SaneData+trimOutputValue"></a>

### saneData.trimOutputValue(data) ⇒ <code>Array.&lt;number&gt;</code>
<p>Reduces the maxOutputValue based on OutputCols.</p>

**Kind**: instance method of [<code>SaneData</code>](#SaneData)  

| Param | Type |
| --- | --- |
| data | <code>Array.&lt;number&gt;</code> | 

<a name="SaneData+computeMaxOutputValue"></a>

### saneData.computeMaxOutputValue(value) ⇒ <code>number</code>
<p>Computes the maximum output value possible.</p>

**Kind**: instance method of [<code>SaneData</code>](#SaneData)  

| Param | Type |
| --- | --- |
| value | <code>number</code> | 

<a name="SaneData+computeNumRows"></a>

### saneData.computeNumRows() ⇒ <code>number</code>
<p>Computes the number of rows.</p>

**Kind**: instance method of [<code>SaneData</code>](#SaneData)  
<a name="SaneData+fillUpOutput"></a>

### saneData.fillUpOutput()
<p>Fills up the output array if more input rows than output rows are defined.
This is called after adding new output arrays.</p>

**Kind**: instance method of [<code>SaneData</code>](#SaneData)  
<a name="SaneData+computeNOutputCols"></a>

### saneData.computeNOutputCols(doNotify, allowShrinking) ⇒ <code>number</code>
<p>Computes as much output columns as there are currently used.</p>

**Kind**: instance method of [<code>SaneData</code>](#SaneData)  

| Param | Type |
| --- | --- |
| doNotify | <code>boolean</code> | 
| allowShrinking | <code>boolean</code> | 

<a name="SaneData+importData"></a>

### saneData.importData(saneData)
<p>Imports data and makes them the new dataset.</p>

**Kind**: instance method of [<code>SaneData</code>](#SaneData)  

| Param | Type |
| --- | --- |
| saneData | <code>ISaneData</code> | 

<a name="SaneData+setChar"></a>

### saneData.setChar(customChar, char)
<p>Sets a custom char that the user wants to have.</p>

**Kind**: instance method of [<code>SaneData</code>](#SaneData)  

| Param | Type |
| --- | --- |
| customChar | <code>string</code> | 
| char | <code>string</code> | 

<a name="SaneData.defaultValue"></a>

### SaneData.defaultValue
<p>Default state of the data object.</p>

**Kind**: static property of [<code>SaneData</code>](#SaneData)  
<a name="SaneData.limits"></a>

### SaneData.limits
<p>Sets the limits for the input- and outputcolumns.</p>

**Kind**: static property of [<code>SaneData</code>](#SaneData)  
<a name="SaneExpression"></a>

## SaneExpression
<p>Class to display the minimized expressions.</p>

**Kind**: global class  

* [SaneExpression](#SaneExpression)
    * [.convertToExpression(type, index, centralData)](#SaneExpression+convertToExpression) ⇒ <code>string</code>
    * [.calcOutputs(dataInfo)](#SaneExpression+calcOutputs) ⇒ <code>Array.&lt;any&gt;</code>

<a name="SaneExpression+convertToExpression"></a>

### saneExpression.convertToExpression(type, index, centralData) ⇒ <code>string</code>
<p>Called from data binding. Computes the expression string which is set as the value of the <paper-input>.
Empties any fields set to be a user input field.</p>

**Kind**: instance method of [<code>SaneExpression</code>](#SaneExpression)  
**Returns**: <code>string</code> - <p>The expression string that appears in the <paper-input> field.</p>  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>expressionType</code> | <p>The required form of the equation. Is one of 'expressionType'.</p> |
| index | <code>number</code> | <p>The index of the y-function.</p> |
| centralData |  | <p>The SaneData object.</p> |

<a name="SaneExpression+calcOutputs"></a>

### saneExpression.calcOutputs(dataInfo) ⇒ <code>Array.&lt;any&gt;</code>
<p>Creates an array, that runs from 0 to currently used outputs</p>

**Kind**: instance method of [<code>SaneExpression</code>](#SaneExpression)  

| Param |
| --- |
| dataInfo | 

<a name="SaneFunctionHasard"></a>

## SaneFunctionHasard
<p>Class for the function hasard view</p>

**Kind**: global class  
<a name="SaneNotification"></a>

## SaneNotification
<p>Class for the notification-system in Sane.</p>

**Kind**: global class  
<a name="SaneNotification+toggleNotification"></a>

### saneNotification.toggleNotification(detail)
<p>Displays a notification message. Toast will be closed if string is empty.</p>

**Kind**: instance method of [<code>SaneNotification</code>](#SaneNotification)  

| Param | Type | Description |
| --- | --- | --- |
| detail | <code>Object</code> | <p>The notification as string in an event detail</p> |

<a name="SaneQmcTable"></a>

## SaneQmcTable
<p>Class for the qmc table view.</p>

**Kind**: global class  

* [SaneQmcTable](#SaneQmcTable)
    * [.buildTable(centralData, fnIndex, selectedType)](#SaneQmcTable+buildTable) ⇒ <code>any</code>
    * [.buildSelectTableHead(centralData, fnIndex, selectedType)](#SaneQmcTable+buildSelectTableHead) ⇒ <code>any</code>
    * [.buildSelectTableRows(centralData, fnIndex, selectedType, selectedSolution)](#SaneQmcTable+buildSelectTableRows) ⇒ <code>any</code>
    * [.buildMinimalTermString(centralData, fnIndex, selType)](#SaneQmcTable+buildMinimalTermString) ⇒ <code>any</code>
    * [.getGroupName(idxStep, idxGrp)](#SaneQmcTable+getGroupName) ⇒ <code>string</code>
    * [.checkHasValue(x, y)](#SaneQmcTable+checkHasValue) ⇒ <code>boolean</code>
    * [.calcOutputs(dataInfo)](#SaneQmcTable+calcOutputs) ⇒ <code>Array.&lt;any&gt;</code>

<a name="SaneQmcTable+buildTable"></a>

### saneQmcTable.buildTable(centralData, fnIndex, selectedType) ⇒ <code>any</code>
<p>Compute the array of minimization steps that is used to display the tables.</p>

**Kind**: instance method of [<code>SaneQmcTable</code>](#SaneQmcTable)  
**Returns**: <code>any</code> - <p>An array of minimization steps used in the dom-repeat to build the <table>.</p>  

| Param | Type | Description |
| --- | --- | --- |
| centralData |  | <p>The SaneData object.</p> |
| fnIndex | <code>number</code> | <p>The index of the required y-function.</p> |
| selectedType | <code>number</code> | <p>The required form of the equation as the selected value of the dropdown element.</p> |

<a name="SaneQmcTable+buildSelectTableHead"></a>

### saneQmcTable.buildSelectTableHead(centralData, fnIndex, selectedType) ⇒ <code>any</code>
<p>Compute the head of the implicant selection table.</p>

**Kind**: instance method of [<code>SaneQmcTable</code>](#SaneQmcTable)  
**Returns**: <code>any</code> - <p>An array indices for the table head.</p>  

| Param | Type | Description |
| --- | --- | --- |
| centralData |  | <p>The SaneData object.</p> |
| fnIndex | <code>number</code> | <p>The index of the required y-function.</p> |
| selectedType | <code>number</code> | <p>The required form of the equation as the selected value of the dropdown element.</p> |

<a name="SaneQmcTable+buildSelectTableRows"></a>

### saneQmcTable.buildSelectTableRows(centralData, fnIndex, selectedType, selectedSolution) ⇒ <code>any</code>
<p>Compute the body of the implicant selection table.</p>

**Kind**: instance method of [<code>SaneQmcTable</code>](#SaneQmcTable)  
**Returns**: <code>any</code> - <p>An array of implicant objects.</p>  

| Param | Type | Description |
| --- | --- | --- |
| centralData |  | <p>The SaneData object.</p> |
| fnIndex | <code>number</code> | <p>The index of the required y-function.</p> |
| selectedType | <code>number</code> | <p>The required form of the equation as the selected value of the dropdown element.</p> |
| selectedSolution | <code>number</code> | <p>the number of the selected solution from the solutions dropdown.</p> |

<a name="SaneQmcTable+buildMinimalTermString"></a>

### saneQmcTable.buildMinimalTermString(centralData, fnIndex, selType) ⇒ <code>any</code>
<p>Output the string representation of the minimized function.</p>

**Kind**: instance method of [<code>SaneQmcTable</code>](#SaneQmcTable)  
**Returns**: <code>any</code> - <p>The string representation of the minimized function.</p>  

| Param | Type | Description |
| --- | --- | --- |
| centralData |  | <p>The SaneData object.</p> |
| fnIndex | <code>number</code> | <p>The index of the required y-function.</p> |
| selType | <code>number</code> | <p>The required form of the equation as the selected value of the dropdown element.</p> |

<a name="SaneQmcTable+getGroupName"></a>

### saneQmcTable.getGroupName(idxStep, idxGrp) ⇒ <code>string</code>
<p>Build a group name string for the <table>.</p>

**Kind**: instance method of [<code>SaneQmcTable</code>](#SaneQmcTable)  
**Returns**: <code>string</code> - <p>The full group name.</p>  

| Param | Type | Description |
| --- | --- | --- |
| idxStep | <code>number</code> | <p>Current minimization step. Determines nr. of groups combined.</p> |
| idxGrp | <code>number</code> | <p>Current group, which is the starting group for the string.</p> |

<a name="SaneQmcTable+checkHasValue"></a>

### saneQmcTable.checkHasValue(x, y) ⇒ <code>boolean</code>
<p>Compare two numbers and output 'true' if they are equal. Necessary for dom-if.</p>

**Kind**: instance method of [<code>SaneQmcTable</code>](#SaneQmcTable)  
**Returns**: <code>boolean</code> - <p>'true' if equal, otherwise 'false'.</p>  

| Param | Type | Description |
| --- | --- | --- |
| x | <code>number</code> | <p>A number.</p> |
| y | <code>number</code> | <p>Another number.</p> |

<a name="SaneQmcTable+calcOutputs"></a>

### saneQmcTable.calcOutputs(dataInfo) ⇒ <code>Array.&lt;any&gt;</code>
<p>Creates an array, that runs from 0 to currently used outputs</p>

**Kind**: instance method of [<code>SaneQmcTable</code>](#SaneQmcTable)  

| Param |
| --- |
| dataInfo | 

<a name="SaneSettings"></a>

## SaneSettings
<p>Implements the settings element of sane.</p>

**Kind**: global class  

* [SaneSettings](#SaneSettings)
    * [.importSaneData()](#SaneSettings+importSaneData)
    * [.openSettings()](#SaneSettings+openSettings)
    * [.closeSettings()](#SaneSettings+closeSettings)
    * [.toggleLanguage()](#SaneSettings+toggleLanguage)
    * [.toggleColor()](#SaneSettings+toggleColor)
    * [.isWideLayout()](#SaneSettings+isWideLayout)
    * [.switchLayout()](#SaneSettings+switchLayout)
    * [.exportSaneData()](#SaneSettings+exportSaneData)
    * [.openInputDialog()](#SaneSettings+openInputDialog)
    * [.onCustomCharInput(e)](#SaneSettings+onCustomCharInput)
    * [.computeValidationPattern(e)](#SaneSettings+computeValidationPattern)
    * [.isValid(property, importedObject)](#SaneSettings+isValid) ⇒ <code>boolean</code>

<a name="SaneSettings+importSaneData"></a>

### saneSettings.importSaneData()
<p>Imports another state of sane.</p>

**Kind**: instance method of [<code>SaneSettings</code>](#SaneSettings)  
<a name="SaneSettings+openSettings"></a>

### saneSettings.openSettings()
<p>Opens settings-dialog.</p>

**Kind**: instance method of [<code>SaneSettings</code>](#SaneSettings)  
<a name="SaneSettings+closeSettings"></a>

### saneSettings.closeSettings()
<p>Closes settings-dialog.
To prevent unexpected behavior with the click event and possible under laying elements,
set the iron-selected class in sv-drawer manually.</p>

**Kind**: instance method of [<code>SaneSettings</code>](#SaneSettings)  
<a name="SaneSettings+toggleLanguage"></a>

### saneSettings.toggleLanguage()
<p>Toggles language between English and German.</p>

**Kind**: instance method of [<code>SaneSettings</code>](#SaneSettings)  
<a name="SaneSettings+toggleColor"></a>

### saneSettings.toggleColor()
<p>Toggles color between light-theme and dark-theme.</p>

**Kind**: instance method of [<code>SaneSettings</code>](#SaneSettings)  
<a name="SaneSettings+isWideLayout"></a>

### saneSettings.isWideLayout()
<p>Returns true, iff in dual-view mode</p>

**Kind**: instance method of [<code>SaneSettings</code>](#SaneSettings)  
<a name="SaneSettings+switchLayout"></a>

### saneSettings.switchLayout()
<p>Switches layout between single-view and dual-view.</p>

**Kind**: instance method of [<code>SaneSettings</code>](#SaneSettings)  
<a name="SaneSettings+exportSaneData"></a>

### saneSettings.exportSaneData()
<p>Sets the exportAttribut to the actual state of Sane.</p>

**Kind**: instance method of [<code>SaneSettings</code>](#SaneSettings)  
<a name="SaneSettings+openInputDialog"></a>

### saneSettings.openInputDialog()
<p>Opens file-selection-dialog.</p>

**Kind**: instance method of [<code>SaneSettings</code>](#SaneSettings)  
<a name="SaneSettings+onCustomCharInput"></a>

### saneSettings.onCustomCharInput(e)
<p>Gets new input char value and triggers event with it.</p>

**Kind**: instance method of [<code>SaneSettings</code>](#SaneSettings)  

| Param | Type |
| --- | --- |
| e | <code>Event</code> | 

<a name="SaneSettings+computeValidationPattern"></a>

### saneSettings.computeValidationPattern(e)
<p>Computes the allowed patter in input-field.</p>

**Kind**: instance method of [<code>SaneSettings</code>](#SaneSettings)  

| Param | Type |
| --- | --- |
| e | <code>Event</code> | 

<a name="SaneSettings+isValid"></a>

### saneSettings.isValid(property, importedObject) ⇒ <code>boolean</code>
<p>Recursive validation of given IValidationObj/Prop.</p>
<p>Base cases:
1 - property is an IValidationProp object =&gt; do do type-based validation
2 - not one condition matches =&gt; return false
Recursive step if property is an IValidationObj object</p>
<p>Cases which lead to a recursion step:
1 - property.nbObjects &gt;= 0, fixed size =&gt; normal recursive step
2 -  property.nbObjects &gt;= 0, dynamic size =&gt; recursive step for every key of object array</p>

**Kind**: instance method of [<code>SaneSettings</code>](#SaneSettings)  

| Param | Type |
| --- | --- |
| property | <code>IValidationObj</code> \| <code>IValidationProp</code> | 
| importedObject | <code>IValidationWrapper</code> | 

<a name="SaneTruthTable"></a>

## SaneTruthTable
<p>Class for the truth-table view.</p>

**Kind**: global class  

* [SaneTruthTable](#SaneTruthTable)
    * [.handleAddInputCol()](#SaneTruthTable+handleAddInputCol)
    * [.handleRemInputCol()](#SaneTruthTable+handleRemInputCol)
    * [.handleAddOutputCol()](#SaneTruthTable+handleAddOutputCol)
    * [.handleRemOutputCol()](#SaneTruthTable+handleRemOutputCol)
    * [.handleToggleMask(e)](#SaneTruthTable+handleToggleMask) ⇒ <code>void</code>
    * [.handleToggleBit(e)](#SaneTruthTable+handleToggleBit) ⇒ <code>void</code>
    * [.makeReverseSequence(value)](#SaneTruthTable+makeReverseSequence) ⇒ <code>Array.&lt;number&gt;</code>
    * [.buildRows(dataInfo)](#SaneTruthTable+buildRows) ⇒ <code>Array.&lt;object&gt;</code>
    * [.isGT1(val, offset)](#SaneTruthTable+isGT1) ⇒ <code>boolean</code>
    * [.openOutputSetEditor(e)](#SaneTruthTable+openOutputSetEditor)
    * [.outputSetKeyPressed(e)](#SaneTruthTable+outputSetKeyPressed)
    * [.submitOutputSet(e)](#SaneTruthTable+submitOutputSet)
    * [.submitNewOutputSet(vals, row)](#SaneTruthTable+submitNewOutputSet)
    * [.beautifySet(set)](#SaneTruthTable+beautifySet) ⇒ <code>string</code>

<a name="SaneTruthTable+handleAddInputCol"></a>

### saneTruthTable.handleAddInputCol()
<p>Handle the event when the user wants to add an input column.</p>

**Kind**: instance method of [<code>SaneTruthTable</code>](#SaneTruthTable)  
<a name="SaneTruthTable+handleRemInputCol"></a>

### saneTruthTable.handleRemInputCol()
<p>Handle the event when the user wants to remove an input column.</p>

**Kind**: instance method of [<code>SaneTruthTable</code>](#SaneTruthTable)  
<a name="SaneTruthTable+handleAddOutputCol"></a>

### saneTruthTable.handleAddOutputCol()
<p>Handle the event when the user wants to add an output column.</p>

**Kind**: instance method of [<code>SaneTruthTable</code>](#SaneTruthTable)  
<a name="SaneTruthTable+handleRemOutputCol"></a>

### saneTruthTable.handleRemOutputCol()
<p>Handle the event when the user wants to remove an output column.</p>

**Kind**: instance method of [<code>SaneTruthTable</code>](#SaneTruthTable)  
<a name="SaneTruthTable+handleToggleMask"></a>

### saneTruthTable.handleToggleMask(e) ⇒ <code>void</code>
<p>Toggles the mask of SaneData in row of e.model.index.</p>

**Kind**: instance method of [<code>SaneTruthTable</code>](#SaneTruthTable)  

| Param |
| --- |
| e | 

<a name="SaneTruthTable+handleToggleBit"></a>

### saneTruthTable.handleToggleBit(e) ⇒ <code>void</code>
<p>Calculates the details (cell and row) needed to toggle an output bit in SaneData.</p>

**Kind**: instance method of [<code>SaneTruthTable</code>](#SaneTruthTable)  

| Param |
| --- |
| e | 

<a name="SaneTruthTable+makeReverseSequence"></a>

### saneTruthTable.makeReverseSequence(value) ⇒ <code>Array.&lt;number&gt;</code>
<p>Creates an array, that runs from value to 0.
This will be used to create indices for the table header.</p>

**Kind**: instance method of [<code>SaneTruthTable</code>](#SaneTruthTable)  

| Param | Type |
| --- | --- |
| value | <code>number</code> | 

<a name="SaneTruthTable+buildRows"></a>

### saneTruthTable.buildRows(dataInfo) ⇒ <code>Array.&lt;object&gt;</code>
<p>Creates an array on base of ITruthTableRow.
This will be used to compute the table.
Reacts on changes of SaneData.</p>

**Kind**: instance method of [<code>SaneTruthTable</code>](#SaneTruthTable)  

| Param | Description |
| --- | --- |
| dataInfo | <p>The SaneData object</p> |

<a name="SaneTruthTable+isGT1"></a>

### saneTruthTable.isGT1(val, offset) ⇒ <code>boolean</code>
<p>Returns true if val + offset is bigger than 1.
This is used to add styles to the table.</p>

**Kind**: instance method of [<code>SaneTruthTable</code>](#SaneTruthTable)  

| Param | Type | Default |
| --- | --- | --- |
| val | <code>number</code> |  | 
| offset | <code>number</code> | <code>0</code> | 

<a name="SaneTruthTable+openOutputSetEditor"></a>

### saneTruthTable.openOutputSetEditor(e)
<p>Opens the paper-dialog-window and sets specific attributes.</p>

**Kind**: instance method of [<code>SaneTruthTable</code>](#SaneTruthTable)  

| Param |
| --- |
| e | 

<a name="SaneTruthTable+outputSetKeyPressed"></a>

### saneTruthTable.outputSetKeyPressed(e)
<p>Returns true if the enter key was pressed.
Is used to submit the input of the paper-dialog-window on pressing enter.</p>

**Kind**: instance method of [<code>SaneTruthTable</code>](#SaneTruthTable)  

| Param |
| --- |
| e | 

<a name="SaneTruthTable+submitOutputSet"></a>

### saneTruthTable.submitOutputSet(e)
<p>Closes the paper-dialog-element.
Extracts the index where the set was altered.
Extracts the value (set) put into the paper-input field.
Calls submitNewOutputSet().</p>

**Kind**: instance method of [<code>SaneTruthTable</code>](#SaneTruthTable)  

| Param |
| --- |
| e | 

<a name="SaneTruthTable+submitNewOutputSet"></a>

### saneTruthTable.submitNewOutputSet(vals, row)
<p>Sets the output property of SaneData in outputRows[row].</p>

**Kind**: instance method of [<code>SaneTruthTable</code>](#SaneTruthTable)  

| Param | Type |
| --- | --- |
| vals | <code>string</code> | 
| row | <code>number</code> | 

<a name="SaneTruthTable+beautifySet"></a>

### saneTruthTable.beautifySet(set) ⇒ <code>string</code>
<p>beautifies a set by turning an array of numbers to a string with commas.</p>

**Kind**: instance method of [<code>SaneTruthTable</code>](#SaneTruthTable)  

| Param | Type |
| --- | --- |
| set | <code>Array.&lt;number&gt;</code> | 

<a name="SaneVennDiagramSvg"></a>

## SaneVennDiagramSvg
<p>Class for drawing and adding functions to diagram.</p>

**Kind**: global class  

* [SaneVennDiagramSvg](#SaneVennDiagramSvg)
    * [.ready()](#SaneVennDiagramSvg+ready)
    * [.drawDiagram(locations, selected)](#SaneVennDiagramSvg+drawDiagram)
    * [.addText(element, index, array)](#SaneVennDiagramSvg+addText) ⇒ <code>void</code>
    * [.drawElement(location, index, array)](#SaneVennDiagramSvg+drawElement) ⇒ <code>void</code>
    * [.addElement(center, index)](#SaneVennDiagramSvg+addElement)
    * [.calcNewSet(coordinates, index)](#SaneVennDiagramSvg+calcNewSet) ⇒ <code>void</code>
    * [.getCircleCenter(d3Element)](#SaneVennDiagramSvg+getCircleCenter) ⇒ <code>Array.&lt;number&gt;</code>
    * [.getCircleRadius(d3Element)](#SaneVennDiagramSvg+getCircleRadius) ⇒ <code>number</code>
    * [.ticked()](#SaneVennDiagramSvg+ticked)
    * [.fillNodeArray(element, index, array)](#SaneVennDiagramSvg+fillNodeArray)

<a name="SaneVennDiagramSvg+ready"></a>

### saneVennDiagramSvg.ready()
<p>Function to select often used elements in the SVG before drawing the diagram.</p>

**Kind**: instance method of [<code>SaneVennDiagramSvg</code>](#SaneVennDiagramSvg)  
<a name="SaneVennDiagramSvg+drawDiagram"></a>

### saneVennDiagramSvg.drawDiagram(locations, selected)
<p>Draws Venn Diagram with all elements.</p>

**Kind**: instance method of [<code>SaneVennDiagramSvg</code>](#SaneVennDiagramSvg)  

| Param | Type | Description |
| --- | --- | --- |
| locations | <code>Array.&lt;number&gt;</code> |  |
| selected | <code>Array.&lt;number&gt;</code> | <p>location value: set 0 -&gt; 0; set 1 -&gt; 1; set 2 -&gt; 2; set 3 -&gt; 3 set 12 -&gt; 12; set 13 -&gt; 13; set 23 -&gt; 23; set 123 -&gt; 123; --&gt; example: [12,23,1,0.3] selected value: y0, y4, y6 --&gt; [0,4,6]</p> |

<a name="SaneVennDiagramSvg+addText"></a>

### saneVennDiagramSvg.addText(element, index, array) ⇒ <code>void</code>
<p>Adds output variables as text to circles in diagram.</p>

**Kind**: instance method of [<code>SaneVennDiagramSvg</code>](#SaneVennDiagramSvg)  

| Param | Type | Description |
| --- | --- | --- |
| element | <code>number</code> |  |
| index | <code>number</code> |  |
| array | <code>Array.&lt;number&gt;</code> | <p>normal parameter given by forEach()</p> |

<a name="SaneVennDiagramSvg+drawElement"></a>

### saneVennDiagramSvg.drawElement(location, index, array) ⇒ <code>void</code>
<p>Draws elements inside the specified sets and add drag-function to the Elements using drag().</p>

**Kind**: instance method of [<code>SaneVennDiagramSvg</code>](#SaneVennDiagramSvg)  

| Param | Type | Description |
| --- | --- | --- |
| location | <code>number</code> |  |
| index | <code>number</code> |  |
| array | <code>Array.&lt;number&gt;</code> | <p>location contains a value of {0, 1, 2, 3, 12, 13, 23, 123} index contains a value from 0 to array.length-1 array contains the whole locations Array from draw Diagram()</p> <p>Drag Function call calcNewSet() after drag event.</p> |

<a name="SaneVennDiagramSvg+addElement"></a>

### saneVennDiagramSvg.addElement(center, index)
<p>add elements into svg tag</p>

**Kind**: instance method of [<code>SaneVennDiagramSvg</code>](#SaneVennDiagramSvg)  

| Param | Type |
| --- | --- |
| center | <code>Array.&lt;number&gt;</code> | 
| index | <code>number</code> | 

<a name="SaneVennDiagramSvg+calcNewSet"></a>

### saneVennDiagramSvg.calcNewSet(coordinates, index) ⇒ <code>void</code>
<p>Called after drag and drop event to calculate new set.</p>

**Kind**: instance method of [<code>SaneVennDiagramSvg</code>](#SaneVennDiagramSvg)  

| Param | Type | Description |
| --- | --- | --- |
| coordinates | <code>Array.&lt;number&gt;</code> |  |
| index | <code>number</code> | <p>coordinates contain Values [x, y] index contains value from 0 to locations.length - 1</p> |

<a name="SaneVennDiagramSvg+getCircleCenter"></a>

### saneVennDiagramSvg.getCircleCenter(d3Element) ⇒ <code>Array.&lt;number&gt;</code>
<p>returns property cx and cy of svg Element</p>

**Kind**: instance method of [<code>SaneVennDiagramSvg</code>](#SaneVennDiagramSvg)  

| Param |
| --- |
| d3Element | 

<a name="SaneVennDiagramSvg+getCircleRadius"></a>

### saneVennDiagramSvg.getCircleRadius(d3Element) ⇒ <code>number</code>
<p>returns attribute r fo svg circle</p>

**Kind**: instance method of [<code>SaneVennDiagramSvg</code>](#SaneVennDiagramSvg)  

| Param |
| --- |
| d3Element | 

<a name="SaneVennDiagramSvg+ticked"></a>

### saneVennDiagramSvg.ticked()
<p>function called from force simulation, to change coordinates</p>

**Kind**: instance method of [<code>SaneVennDiagramSvg</code>](#SaneVennDiagramSvg)  
<a name="SaneVennDiagramSvg+fillNodeArray"></a>

### saneVennDiagramSvg.fillNodeArray(element, index, array)
<p>Fills the global nodeArray with nodes.</p>

**Kind**: instance method of [<code>SaneVennDiagramSvg</code>](#SaneVennDiagramSvg)  

| Param | Type |
| --- | --- |
| element |  | 
| index | <code>number</code> | 
| array | <code>Array.&lt;any&gt;</code> | 

<a name="SaneVennDiagram"></a>

## SaneVennDiagram
<p>Class for calculating the venn diagram.</p>

**Kind**: global class  

* [SaneVennDiagram](#SaneVennDiagram)
    * [.updateBit(indice, newSet)](#SaneVennDiagram+updateBit)
    * [.getBit(value, index)](#SaneVennDiagram+getBit) ⇒ <code>number</code> \| <code>&quot;?&quot;</code>
    * [.onChangeEvent()](#SaneVennDiagram+onChangeEvent)
    * [.onChangeRow()](#SaneVennDiagram+onChangeRow)
    * [.checkLimit()](#SaneVennDiagram+checkLimit) ⇒ <code>void</code>
    * [.setSelectedY()](#SaneVennDiagram+setSelectedY) ⇒ <code>boolean</code>
    * [.setOfY(centralData, index)](#SaneVennDiagram+setOfY) ⇒ <code>Array.&lt;number&gt;</code>
    * [.makeUpwardSequence(value)](#SaneVennDiagram+makeUpwardSequence) ⇒ <code>Array.&lt;number&gt;</code>

<a name="SaneVennDiagram+updateBit"></a>

### saneVennDiagram.updateBit(indice, newSet)
<p>Calculates bitvalues of the indice.
Compares the value of the new bits (calculated and stored in newBits) with the old bits in SaneData (with getBit)
if varied bits will be toggled.</p>

**Kind**: instance method of [<code>SaneVennDiagram</code>](#SaneVennDiagram)  

| Param | Type | Description |
| --- | --- | --- |
| indice | <code>number</code> | <p>e.g. 15</p> |
| newSet | <code>Array.&lt;number&gt;</code> | <p>([0], [1], [2], [3], [1,2], [2,3], [1,3], [1,2,3])</p> |

<a name="SaneVennDiagram+getBit"></a>

### saneVennDiagram.getBit(value, index) ⇒ <code>number</code> \| <code>&quot;?&quot;</code>
<p>Calculates bit value at the position of index of Y.</p>

**Kind**: instance method of [<code>SaneVennDiagram</code>](#SaneVennDiagram)  

| Param | Type |
| --- | --- |
| value | <code>Array.&lt;number&gt;</code> \| <code>number</code> | 
| index | <code>number</code> | 

<a name="SaneVennDiagram+onChangeEvent"></a>

### saneVennDiagram.onChangeEvent()
<p>EventListener on change data.nOutputColumns &amp; on-change checkbox
Ensures that not more than 3 checkboxes are selected
if selectedY changed setOfK gets calculated again</p>

**Kind**: instance method of [<code>SaneVennDiagram</code>](#SaneVennDiagram)  
<a name="SaneVennDiagram+onChangeRow"></a>

### saneVennDiagram.onChangeRow()
<p>EventListener on change data.OutputRows</p>

**Kind**: instance method of [<code>SaneVennDiagram</code>](#SaneVennDiagram)  
<a name="SaneVennDiagram+checkLimit"></a>

### saneVennDiagram.checkLimit() ⇒ <code>void</code>
<p>Event starts when a Checkbox checked value is changed.
Ensures that is always 1,2 or 3 ys selected.
3 checkboxes selected: all others get disabled
else: all get enabled</p>

**Kind**: instance method of [<code>SaneVennDiagram</code>](#SaneVennDiagram)  
<a name="SaneVennDiagram+setSelectedY"></a>

### saneVennDiagram.setSelectedY() ⇒ <code>boolean</code>
<p>Sets this.selectedY as the ids of the checked checkboxes</p>

**Kind**: instance method of [<code>SaneVennDiagram</code>](#SaneVennDiagram)  
**Returns**: <code>boolean</code> - <p>returns true if this.selectedY changed, false if not</p>  
<a name="SaneVennDiagram+setOfY"></a>

### saneVennDiagram.setOfY(centralData, index) ⇒ <code>Array.&lt;number&gt;</code>
<p>Returns set of y(index).</p>

**Kind**: instance method of [<code>SaneVennDiagram</code>](#SaneVennDiagram)  

| Param | Type |
| --- | --- |
| centralData |  | 
| index | <code>number</code> | 

<a name="SaneVennDiagram+makeUpwardSequence"></a>

### saneVennDiagram.makeUpwardSequence(value) ⇒ <code>Array.&lt;number&gt;</code>
<p>Creates an array, that runs from 0 to value.
This will be used to create checkboxes for all ys.</p>

**Kind**: instance method of [<code>SaneVennDiagram</code>](#SaneVennDiagram)  

| Param | Type |
| --- | --- |
| value | <code>number</code> | 

<a name="SaneMath"></a>

## SaneMath ⇒
<p>Mixin to allow typesetting math via MathJax.</p>

**Kind**: global mixin  
**Returns**: <p>Mixin The class which contains the new methods.</p>  
**Access**: public  
**Mixinfunction**:   

| Param | Type | Description |
| --- | --- | --- |
| base | <code>T</code> | <p>The base-class which will become the new functions.</p> |

<a name="left"></a>

## left
<p>Provides the information on which side the view will be opened.</p>

**Kind**: global variable  
<a name="page"></a>

## page
<p>Contains the name of last clicked view.</p>

**Kind**: global variable  
<a name="pageLeft"></a>

## pageLeft
<p>Contains the name of left view.</p>

**Kind**: global variable  
<a name="pageRight"></a>

## pageRight
<p>Contains the name of right view.</p>

**Kind**: global variable  
<a name="reload"></a>

## reload
<p>Reload of side?</p>

**Kind**: global variable  
<a name="routeData"></a>

## routeData
<p>Contains data of the app-route element.</p>

**Kind**: global variable  
<a name="shortNames"></a>

## shortNames
<p>Show short names?</p>

**Kind**: global variable  
<a name="wideLayout"></a>

## wideLayout
<p>Show wide layout?</p>

**Kind**: global variable  
<a name="saneAppLocalizeBehaviorBase"></a>

## saneAppLocalizeBehaviorBase
<p>Base class of AppLocalizeBehavior.</p>

**Kind**: global constant  
<a name="qmclibCache"></a>

## qmclibCache
<p>The qmclib cache.
Is initialized with empty results and fixed size 7 (max output columns).</p>

**Kind**: global constant  
<a name="AppLocalizeMixin"></a>

## AppLocalizeMixin() ⇒ <code>class</code>
<p>Like a Mixin which returns Polymer.Element extended with AppLocalizeBehavior and localizeSane.</p>

**Kind**: global function  
**Returns**: <code>class</code> - <p>Polymer.mixinBehaviors([Polymer.AppLocalizeBehavior],Polymer.Element extended with localizeSane</p>  
**Mixinfunction**:   
<a name="getExpressionAsTerms"></a>

## getExpressionAsTerms(data, expType, index) ⇒ <code>string</code>
<p>Compute the data of a y-function to the required expression - as a string.</p>

**Kind**: global function  
**Returns**: <code>string</code> - <p>The computed equation as a string.</p>  

| Param | Type | Description |
| --- | --- | --- |
| data |  | <p>The SaneData object.</p> |
| expType | <code>expressionType</code> | <p>The required form of the equation. Is one of 'expressionType'.</p> |
| index | <code>number</code> | <p>The index of the y-function.</p> |

<a name="getExpressionAsExpTrees"></a>

## getExpressionAsExpTrees(data, expType, index) ⇒ <code>any</code>
<p>Compute the data of a y-function to the required expression - as an expTree.</p>

**Kind**: global function  
**Returns**: <code>any</code> - <p>The computed equation as an expTree.</p>  

| Param | Type | Description |
| --- | --- | --- |
| data |  | <p>The SaneData object.</p> |
| expType | <code>expressionType</code> | <p>The required form of the equation. Is one of 'expressionType'.</p> |
| index | <code>number</code> | <p>The index of the y-function.</p> |

<a name="makeStringFromExpTree"></a>

## makeStringFromExpTree(expTree, chars) ⇒ <code>string</code>
<p>Parses the expTree into a string.</p>

**Kind**: global function  
**Returns**: <code>string</code> - <p>The string.</p>  

| Param | Description |
| --- | --- |
| expTree | <p>The expTree.</p> |
| chars | <p>The SaneData object.</p> |

<a name="makeLaTeXFromExpTree"></a>

## makeLaTeXFromExpTree(expTree, data) ⇒ <code>string</code>
<p>Parses the expTree into a LaTeX math formula.</p>

**Kind**: global function  
**Returns**: <code>string</code> - <p>The LaTeX math string.</p>  

| Param | Description |
| --- | --- |
| expTree | <p>The expTree.</p> |
| data | <p>The SaneData object.</p> |

<a name="getFunctionIndexFromTree"></a>

## getFunctionIndexFromTree(expTree, data) ⇒ <code>number</code>
<p>Compute a function index from a expression tree object.</p>

**Kind**: global function  
**Returns**: <code>number</code> - <p>The function index equivalent to the expression tree as a decimal number.</p>  

| Param | Type | Description |
| --- | --- | --- |
| expTree | <code>object</code> | <p>The expression tree object.</p> |
| data |  | <p>The SaneData object.</p> |

<a name="getVariablesFromTree"></a>

## getVariablesFromTree(expTree) ⇒ <code>Array.&lt;number&gt;</code> \| <code>number</code>
<p>Helper function for 'getFunctionIndexFromTree'. Fetches all x variables in the expression tree.</p>

**Kind**: global function  
**Returns**: <code>Array.&lt;number&gt;</code> \| <code>number</code> - <p>An array of all x variables. A single x variable as number for recursion.</p>  

| Param | Description |
| --- | --- |
| expTree | <p>The expression tree of the equation.</p> |

<a name="calcValueForAssignment"></a>

## calcValueForAssignment(expTree, assignment) ⇒ <code>boolean</code>
<p>Helper function for 'getFunctionIndexFromTree'.
Fetch the true/false row assignment for the expression tree.</p>

**Kind**: global function  
**Returns**: <code>boolean</code> - <p>The true/false row assignment. A single boolean value for recursion.</p>  

| Param | Type | Description |
| --- | --- | --- |
| expTree |  | <p>The expression tree of the equation.</p> |
| assignment | <code>Array.&lt;boolean&gt;</code> | <p>True/false row assignments for recursion.</p> |

<a name="getMinimalTerms"></a>

## getMinimalTerms(data, index, minType) ⇒ <code>any</code>
<p>The main function for the minimization process of a y-function.
Uses helper functions to calculate steps and manages the return values.</p>

**Kind**: global function  
**Returns**: <code>any</code> - <p>qmcSteps[] as an array of all minimization steps.
qmcSteps.piSteps 		The array of minimization sub-steps as prime implicant tables, containing implicant objects.
qmcSteps.implicants 		All unused prime implicants.
qmcSteps.initialTable	The prime implicant selection table.
qmcSteps.solvedTable		The prime implicant selection table containing one solution. Is the first solution by default.
qmcSteps.minTrees			The minimized expression as an expression tree.
qmcSteps.minTerms			The minimized expression as a string.</p>  

| Param | Type | Description |
| --- | --- | --- |
| data |  | <p>The SaneData object.</p> |
| index | <code>number</code> | <p>The index of the y-function.</p> |
| minType | <code>expressionType</code> | <p>The required form of the equation. Is one of 'expressionType'.</p> |

<a name="getPrimeImplicants"></a>

## getPrimeImplicants(data, index, type) ⇒ <code>Array.&lt;IPrimeImplicant&gt;</code>
<p>Helper function for 'getMinimalTerms'.
Compute an array of minimization sub-steps with indices in the form presented in the lectures and materials.</p>

**Kind**: global function  
**Returns**: <code>Array.&lt;IPrimeImplicant&gt;</code> - <p>Step 0 of qmcSteps[]. The array of minimization sub-steps.</p>  

| Param | Type | Description |
| --- | --- | --- |
| data |  | <p>The SaneData object.</p> |
| index | <code>number</code> | <p>The index of the y-function.</p> |
| type | <code>expressionType</code> | <p>The required form of the equation. Is one of 'expressionType'.</p> |

<a name="getT0Implicants"></a>

## getT0Implicants(nrXVars) ⇒ <code>Array.&lt;IPrimeImplicant&gt;</code>
<p>Helper function for 'getPrimeImplicants'.
Build groups with all (possible) unfiltered indices.</p>

**Kind**: global function  
**Returns**: <code>Array.&lt;IPrimeImplicant&gt;</code> - <p>Step 0 of piSteps[]. The unfiltered prime implicants.</p>  

| Param | Type | Description |
| --- | --- | --- |
| nrXVars | <code>number</code> | <p>Numer of x variables in SaneData.</p> |

<a name="getInitialIndices"></a>

## getInitialIndices(data, index, type) ⇒ <code>Array.&lt;string&gt;</code>
<p>Helper function for 'getPrimeImplicants'.
Fetch all inidces where y_n = value or h* is true. Value depends on type.</p>

**Kind**: global function  
**Returns**: <code>Array.&lt;string&gt;</code> - <p>An array with all indices for y_n.</p>  

| Param | Type | Description |
| --- | --- | --- |
| data |  | <p>The SaneData object.</p> |
| index | <code>number</code> | <p>The index of the y-function.</p> |
| type | <code>expressionType</code> | <p>The required form of the equation. Is one of 'expressionType'.</p> |

<a name="getMinTable"></a>

## getMinTable(step) ⇒ <code>IMinTable</code>
<p>Helper function for 'getMinimalTerms'.
Build an object representing the prime implicant selection table.</p>

**Kind**: global function  
**Returns**: <code>IMinTable</code> - <p>Step 2 of qmcSteps[]. The prime implicant selection table.</p>  

| Param | Type | Description |
| --- | --- | --- |
| step | <code>Array.&lt;IPrimeImplicant&gt;</code> | <p>Step 1 of qmcSteps[]. All unused prime implicants.</p> |

<a name="solveMinTable"></a>

## solveMinTable(step) ⇒ <code>IMinTable</code>
<p>Helper function for 'getMinimalTerms'.
Calculate a solution for the given selection table.</p>

**Kind**: global function  
**Returns**: <code>IMinTable</code> - <p>Step 3 of qmcSteps[]. The The minimitazion table containing one solution.</p>  

| Param | Type | Description |
| --- | --- | --- |
| step | <code>IMinTable</code> | <p>Step 2 of qmcSteps[]. The prime implicant selection table.</p> |

<a name="applyArrayShortening"></a>

## applyArrayShortening(arr) ⇒ <code>Array.&lt;Array.&lt;number&gt;&gt;</code>
<p>Helper function for 'solveMinTable'.
Shorten the array by applying 'XX=X', 'X+X=X' and 'X+XY=X'.</p>

**Kind**: global function  
**Returns**: <code>Array.&lt;Array.&lt;number&gt;&gt;</code> - <p>The reduced or-array.</p>  

| Param | Type | Description |
| --- | --- | --- |
| arr | <code>Array.&lt;Array.&lt;number&gt;&gt;</code> | <p>The first or-array of implicants in the current step of 'solveMinTable'.</p> |

<a name="makeTreesFromMin"></a>

## makeTreesFromMin(mintable, type) ⇒ <code>any</code>
<p>Helper function for 'getMinimalTerms'.
Compute an expression tree for the given solution of the selection table.</p>

**Kind**: global function  
**Returns**: <code>any</code> - <p>Step 4 of qmcSteps[]. The minimized expression as an expression tree.</p>  

| Param | Type | Description |
| --- | --- | --- |
| mintable | <code>IMinTable</code> | <p>Step 3 of qmcSteps[]. The The minimitazion table containing one solution.</p> |
| type | <code>expressionType</code> | <p>The required form of the equation. Is one of 'expressionType'.</p> |

<a name="typeset"></a>

## typeset(node, formula)
<p>Renders the string formula that has to be LaTeX to the textContent of the element node as math.</p>

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| node | <code>HTMLElement</code> | <p>The Element to render to.</p> |
| formula | <code>string</code> | <p>The string that will be rendered. It has to be LaTeX withouth math delimeters, like \(\).</p> |

<a name="setStartConfig"></a>

## setStartConfig(uri)
<p>Set a new global start configuration.</p>

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| uri | <code>string</code> | <p>The raw string from the url parameter.</p> |

<a name="checkSCData"></a>

## checkSCData() ⇒ <code>any</code> \| <code>undefined</code>
<p>Check if a SaneData object exists in the start configuration.</p>

**Kind**: global function  
**Returns**: <code>any</code> \| <code>undefined</code> - <p>The SaneData object in the start configuration - if one exists.</p>  
<a name="checkSCViews"></a>

## checkSCViews() ⇒ <code>object</code> \| <code>undefined</code>
<p>Check if there is information about the default views in the start configuration.</p>

**Kind**: global function  
**Returns**: <code>object</code> \| <code>undefined</code> - <p>An object with the view names - if they exist.</p>  
<a name="checkSCBlockedFeatures"></a>

## checkSCBlockedFeatures(blockedFeatureView, feature) ⇒ <code>any</code>
<p>Check if any feature of the blocked features exists in the start configuration.</p>

**Kind**: global function  
**Returns**: <code>any</code> - <p>The result of the check with the value depending on the feature.</p>  

| Param | Type | Description |
| --- | --- | --- |
| blockedFeatureView | <code>string</code> | <p>The view that needs information.</p> |
| feature | <code>string</code> | <p>The feature that needs to be checked.</p> |

