define([
	"require",
	"intern!object",
	"intern/chai!assert",
	"dojo/on",
	"dojo/Deferred",
	"../DisplayContainer",
	"./DisplayController",
	"../Widget",
	"../register",
	"dojo/domReady!"
], function (require, registerSuite, assert, on, Deferred, DisplayContainer, DisplayController, Widget, register) {
	var container;
	registerSuite({
		name: "DisplayContainer",
		setup: function () {
			container = document.createElement("div");
			document.body.appendChild(container);
		},
		// test with original DisplayController
		original : function () {
			this.timeout = 5000;
			var deferred = new Deferred();
			register("test-default-display-container", [HTMLElement, Widget, DisplayContainer]);
			var dcontainer = register.createElement("test-default-display-container");
			function initView(view) {
				dcontainer.appendChild(view);
				view.style.visibility = "hidden";
				view.style.display = "none";
			}
			function testView(view) {
				assert.strictEqual("visible", view.style.visibility, "visibility");
				assert.strictEqual("", view.style.display, "display");
			}
			var view1 = document.createElement("div");
			initView(view1);
			var view2 = document.createElement("div");
			view2.setAttribute("id", "view");
			initView(view2);
			container.appendChild(dcontainer);
			dcontainer.startup();
			var event;
			// by node
			on.emit(document, "delite-display", event = {
				dest: view1,
				transitionDeferred: new Deferred(),
				bubbles: false,
				cancelable: true
			});
			event.transitionDeferred.then(function () {
				testView(view1);
				// by id
				on.emit(document, "delite-display", event = {
					dest: "view",
					transitionDeferred: new Deferred(),
					bubbles: false,
					cancelable: true
				});
				event.transitionDeferred.then(function () {
					testView(view2);
					// test is finished
					deferred.resolve(true);
				});
			});
			return deferred.promise;
		},
		// test with custom DisplayController
		custom : function () {
			this.timeout = 5000;
			var deferred = new Deferred();
			DisplayController.unregister();
			DisplayController.registerCustom();
			register("test-custom-display-container", [HTMLElement, Widget, DisplayContainer]);
			var dcontainer = register.createElement("test-custom-display-container");
			dcontainer.setAttribute("id", "dcontainer");
			container.appendChild(dcontainer);
			dcontainer.startup();
			function testView(view) {
				assert.strictEqual("visible", view.style.visibility, "visibility");
				assert.strictEqual("", view.style.display, "display");
				assert.strictEqual(dcontainer, view.parentNode, "parentNode");
			}
			var event;
			// by node
			on.emit(document, "delite-display", event = {
				dest: "view1",
				transitionDeferred: new Deferred(),
				bubbles: true,
				cancelable: true
			});
			event.transitionDeferred.then(function () {
				testView(document.getElementById("view1"));
				on.emit(document, "delite-display", event = {
					dest: "view2",
					transitionDeferred: new Deferred(),
					bubbles: true,
					cancelable: true
				});
				event.transitionDeferred.then(function () {
					testView(document.getElementById("view2"));
					// test is finished
					deferred.resolve(true);
				});
			});
			return deferred.promise;
		},
		teardown : function () {
			container.parentNode.removeChild(container);
		}
	});
});
