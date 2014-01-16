define(["dojo/on", "dojo/Deferred", "dcl/dcl"], function (on, Deferred, dcl) {
	function getDisplayContainer(element) {
		var parentNode = element.parentNode;
		if (parentNode == null) {
			return null;
		} else {
			if (parentNode.show && parentNode.performDisplay) {
				return parentNode;
			}
			return getDisplayContainer(parentNode);
		}
	}

	function displayHandler(event) {
		// we work either by id or by node
		var destElement = typeof event.dest === "string" ? document.getElementById(event.dest) : event.dest;
		getDisplayContainer(destElement).show(event.dest, event).then(function () {
			event.transitionDeferred.resolve();
		});
	}

	function loadHandler(event) {
		// TODO implement simple view loading like in dojox/mobile or let dapp always handle complex cases or
		// provide alternate DisplayController as separated projects
		event.loadDeferred.resolve({
			child: typeof event.dest === "string" ? document.getElementById(event.dest) : event.dest
		});
	}

	var r = {
		// summary:
		//		This module is a minimal display controller allowing display actions to be dispatched to the right
		//		DisplayContainer.

		show: function (dest, params) {
			// summary:
			//		This method must be called to display a given destination child in its parent container.
			// dest:
			//		Widget, DOM Node or there ids that points to child to be displayed
			// params:
			//		Optional params that might be taken into account when displaying the child. This can be the
			//		type of visual transitions involved. This might varies from one DisplayContainer to another.
			// returns:
			//		A promise that will be resolved when the display & transition effect will have been
			// 		performed.
			var event = {
				dest: dest,
				transitionDeferred: new Deferred(),
				bubble: false,
				cancelable: true
			};
			dcl.mix(event, params);
			on.emit(document, "delite-display", event);
			return event.transitionDeferred;
		},

		register: function () {
			// summary:
			//		This method registers the controller which is then active. This is only useful if urregister has
			//		been called previously as the controller is registered by default.
			document.addEventListener("delite-display-load", loadHandler);
			document.addEventListener("delite-display", displayHandler);
		},

		unregister: function () {
			// summary:
			//		This method unregisters the controller which is then inactive. This is useful to call before
			//		loading a custom controller.
			document.removeEventListener("delite-display-load", loadHandler);
			document.removeEventListener("delite-display", displayHandler);
		}
	};

	r.register();

	return r;
});

