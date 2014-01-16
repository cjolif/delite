// fake DisplayController to test kind of things dapp will be doing
define(["dojo/Deferred", "../DisplayController"], function (Deferred, DisplayController) {
	var parents = {
		"view1" : "dcontainer",
		"view2" : "dcontainer"
	};
	var contents = {
	};
	function initView(view, id) {
		view.setAttribute("id", id);
		view.style.visibility = "hidden";
		view.style.display = "none";
	}

	initView(contents.view1 = document.createElement("div"), "view1");
	initView(contents.view2 = document.createElement("div"), "view2");

	function displayHandler(event) {
		document.getElementById(parents[event.dest]).show(event.dest, event).then(function () {
			event.transitionDeferred.resolve();
		});
	}

	function loadHandler(event) {
		event.loadDeferred.resolve({
			child: contents[event.dest]
		});
	}

	DisplayController.registerCustom = function () {
		document.addEventListener("delite-display-load", loadHandler);
		document.addEventListener("delite-display", displayHandler);
	};

	return DisplayController;
});

