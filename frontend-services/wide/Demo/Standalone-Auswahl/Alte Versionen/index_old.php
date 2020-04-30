<?php
if(!(isset($_GET['BPUType'])) || !(isset($_GET['PSPUType']))) {
	header('Location: choose.html');
}
else {
	echo("Ausgewählt wurde:\n");
	echo("
		<ul>
			<li>Steuereinheit: ".$_GET['BPUType']."</li>
			<li>Physisches System: ".$_GET['PSPUType']."</li>
			<li>Programmiersprache: ".$_GET['Lang']."</li>
		</ul>");
	
}
?>