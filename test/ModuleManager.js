var assert = require('assert');
var path = require('path');
var ModuleManager = require('..');

describe('Module Manager Functions', function() {
	it('should install and load a series of modules', function(done) {

		this.timeout(30000); // Allow 30 seconds for this to complete

		var moduleNpm = 'file:' + path.join(__dirname, 'module-loader-test-module');

		var manager = ModuleManager();

		var modules = {};

		// Load three modules
		// Module 1 depends on Module 2 and 3 (available as test2, test3)
		modules.test1 = {
			npm: moduleNpm,
			argument: {
				whoami: 'test1',
				callback: loadCallback
			},
			modules: {
				test2: 'test2',
				test3: 'test3'
			}
		};

		modules.test2 = {
			npm: moduleNpm,
			argument: {
				whoami: 'test2',
				callback: loadCallback
			},
			modules: {
				test3: 'test3'
			}
		};

		modules.test3 = {
			npm: moduleNpm,
			argument: {
				whoami: 'test3',
				callback: loadCallback
			}
		};

		var loadOrder = ['test3', 'test2', 'test1'];

		function loadCallback(whoami) {
			if(loadOrder[0] != whoami)
				throw new Error("Wrong load order");

			loadOrder.shift();
		}

		manager.installLoadModules(modules, function(error, modulesLoaded) {
			if(error)
				throw new Error(error);
			else {
				for(var moduleKey in modules) {
					if(typeof modulesLoaded[moduleKey] == 'undefined')
						throw new Error('Module not in loaded list');

					if(modulesLoaded[moduleKey].whoami() != moduleKey)
						throw new Error('Module\'s whoami does not match');

					var dependentModules = modulesLoaded[moduleKey].modules();
					for(var dependentModuleKey in modules[moduleKey].modules) {
						if(typeof dependentModules[dependentModuleKey] == 'undefined')
							throw new Error('Dependent module not found');
					}
				}

				if(loadOrder.length)
					throw new Error("Module load callbacks not called");

				done();
			}
		});
	});
});