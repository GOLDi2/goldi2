<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<title>Title</title>
		<?php
			if(!(issset($_GET['BPUType'])) || !(isset($_GET['PSPUType']))) {
				echo("<meta http-equiv='refresh' content='0;URL=choose.html'>");
			}
		?>
	</head>
	<body>
		<!-- ?php
			else {
		?> -->
		<h3>Auswahl:</h3>
		<ul>
			<?php
				echo("<li>Steuereinheit:".$_GET['BPUType']."</li>");
				echo("<li>Programmiersprache:".$_GET['Lang']."</li>");
				echo("<li>Physisches System:".$_GET['PSPUType']."</li>");
			?>
		</ul>
		<script src="../../monaco-editor/min/vs/loader.js" />
		<script src="../../monaco-editor/min/vs/editor/editor.main.js" />
		<script src="../../monaco-editor/min/vs/editor/editor.main.nls.js" />
		<div id="container" style="width:100% !important; height:650px">
			<script type="application/javascript">
				var editor = monaco.editor.create(document.getElementById("container"), {
					theme: vs,
					value: "",
					language: <?php echo($_GET['Lang']); ?>
				});
			</script>
		</div>
		<!-- ?php
			}
		?> -->
	</body>
</html>