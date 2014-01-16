define(["dcl/dcl", "dojo/on", "dojo/Deferred", "dojo/when", "delite/Container", "delite/DisplayController"],
	function (dcl, on, Deferred, when, Container) {
	return dcl(Container, {
		// summary:
		//		Mixin for widget containers that needs to show on or off.
		// description:
		//		When the show method is called a container extending this mixin is able to be notified that one of
		//		its children must be displayed. Before displaying it, it will fire the delite-display-load event
		//		giving a chance to a listener to load and create the child if not yet available before proceeding with
		//		the display.

		show: function (dest, params) {
			// summary:
			//		This method must be called to display the container with a particular destination child.
			// dest:
			//		Widget or HTMLElement or id of those that points to the child this container must display
			// params:
			//		Optional params that might be taken into account when displaying the child. This can be the
			//		type of visual transitions involved. This might varies from one DisplayContainer to another.
			// returns:
			//		A promise that will be resolved when the display & transition effect will have been
			// 		performed.

			// we need to warn potential app controller we are going to load a view & transition
			var event = {
				dest: dest,
				transitionDeferred: new Deferred(),
				loadDeferred: new Deferred(),
				bubble: false,
				cancelable: true
			};
			var self = this;
			dcl.mix(event, params);
			// we now need to warn potential app controller we need to load a new child
			event.loadDeferred.then(function (value) {
				// if view is not already a child this means we loaded a new view (div), add it
				if (self.getIndexOfChild(value.child) === -1) {
					self.addChild(value.child, value.index);
				}
				// the child is here, actually perform the display
				when(self.performDisplay(value.child, event), function () {
					event.transitionDeferred.resolve(value);
				});
			});
			on.emit(document, "delite-display-load", event);
			return event.transitionDeferred.promise;
		},

		performDisplay: function (/*jshint unused: vars*/widget, event) {
			// summary:
			//		This method must perform the display and possible transition effect. It is meant to be
			//		specialized by subclasses.
			// returns:
			//		Optionally a promise that will be resolved when the display & transition effect will have
			//		been performed.
			// tags:
			//		protected
			widget.style.visibility = "visible";
			widget.style.display = "";
		}
	});
});