/* global app */
var fsm;

	function Fsm(name) {
		this.storage = new app.Store(name);
		this.parser = new app.Parser();
		this.model = new app.Model(this.storage, this.parser);
		this.view = new app.View(this.parser);
		this.controller = new app.Controller(this.model, this.view, this.parser);
	}

	function startView() {
		try {
			$.i18n.init({fallbackLng: 'en-US', preload: ['en-US','de-DE'] } , function () {
				$(document).i18n();
			});

			//fsm.controller.setView();
		}catch(err){

		}

	}

	fsm = new Fsm('FSM-SD');
    var editable = true;

	window.addEventListener('load', startView);
