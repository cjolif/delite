// fake DisplayController to test kind of things dapp will be doing
define(["dojo/Deferred"], function (Deferred) {
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
	var r = {
		original: true,
		useOriginal: function (value) {
			var deferred = new Deferred();
			r.original = value;
			if (value) {
				require(["delite/DisplayControllerOriginal"], function () {
					deferred.resolve(true);
				});
			} else {
				deferred.resolve(true);
			}
			return deferred.promise;
		}
	};

	initView(contents.view1 = document.createElement("div"), "view1");
	initView(contents.view2 = document.createElement("div"), "view2");

	function displayHandler(event) {
		if (!r.original) {
			if (event.target === document) {
				event.stopImmediatePropagation();
				var destContainer = document.getElementById(parents[event.dest]);
				destContainer.emit("delite-display", event);
			}
		}
	}

	function loadHandler(event) {
		if (!r.original) {
			event.stopImmediatePropagation();
			event.loadDeferred.resolve({
				child: contents[event.dest]
			});
		}
	}

	document.addEventListener("delite-display-load", loadHandler);
	document.addEventListener("delite-display", displayHandler, true);

	return r;
});

