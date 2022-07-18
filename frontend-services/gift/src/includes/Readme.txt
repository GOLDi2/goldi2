   	<script src="includes/Adapter/DTToAT/DTToAT.js"></script>
    <script src="includes/Adapter/ATToDT/ATToDT.js"></script>
    <script src="includes/Adapter/DTToEq/DTToEq.js"></script>
    <script src="includes/Adapter/EqToDT/EqToDT.js"></script>
    <script src="includes/Datentyp/DataType.js"></script>
    <script src="includes/QMC/qmc.js"></script>
    <script src="includes/QMC/EquationNormalizer.js"></script>
	<script src="includes/QMC/Logic.js"></script>
    <script src="includes/Automatentabelle/script.js"></script>
	<script src="includes/Transitionsmatrix/functions.js"></script>   
    <script src="includes/Vollständigkeit/completeness.js"></script>
    <script src="includes/Widerspruchsfreiheit/consistency.js"></script>
	<script src="includes/Stabilität/stability.js"></script>
    <script src="includes/checkfunctions.js"></script>
	<script src="includes/zy_equations/zy_equations.js"></script>
	<script src="includes/wavedrom/skins/default.js"></script>
    <script src="includes/wavedrom/wavedrom.max.js"></script>
    <script src="includes/wavedrom/wavedrom_addon.js"></script>
	<script src="includes/controller.js"></script>
	
	
Als Funktionen bräuchte ich dann:

controller.transformToMTableInputside()		Transitionsmatrix-Eingabeseite
controller.transformToTTableInputside()		Automatentabelle-Eingabeseite
controller.transformToEquationInputside()		Gleichungen-Eingabeseite
controller.transformToMTableOutputside()		Transitionsmatrix-Ausgabeseite
controller.transformToTTableOutputside()		Automatentabelle-Ausgabeseite
controller.transformToEquationOutputside()		Gleichungen-Ausgabeseite
controller.activateSimulation()		Simulation
controller.activateFlipFlop()		FlipFlops


Für die Graphen weiß ich noch nicht wie das dann gelöst wird.
Transitionsmatrix und Automatentabelle sollte dann soweit schon funktionieren. Bei den Gleichungen,Simulation,FlipFlop wird nichts passieren. Das kommt dann noch später über die controller.js rein.
