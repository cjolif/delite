// Test file to run infrastructure tests locally.
// Run using "runlocal.sh"
define(["./intern"], function (intern) {
	var config = {
		// Browsers to run tests against
		environments: [
			{ browserName: "firefox" },
			{ browserName: "safari" },
			{ browserName: "chrome" }
		],

		// Whether or not to start Sauce Connect before running tests
		useSauceConnect: false,

		// Functional test suite(s) to run in each browser once non-functional tests are completed
		functionalSuites: [ "delite/tests/functional/all" ],
		reporters : ["console"],
		// A regular expression matching URLs to files that should not be included in code coverage analysis
		excludeInstrumentation: /^(requirejs|dcl|dojo|platform|delite\/tests|.*\/themes)/
	};

	for (var key in intern) {
		config[key] = intern[key];
	}

	return config;
});
