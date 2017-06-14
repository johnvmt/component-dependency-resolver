var assert = require('assert');
var path = require('path');
var ModuleLoader = require('../src/ModuleLoader');
var ModuleInstaller = require('../src/ModuleInstaller');

describe('Module Installer Functions', function() {

	// Install the module that we will load
	before(function(done){
		this.timeout(30000); // Allow 30 seconds for this to complete

		var installer = ModuleInstaller();

		installer.installNpmModule('file:' + path.join(__dirname, 'module-loader-test-module'), function(error, installStatus) {
			if(error)
				throw new Error(error);
			else if(installStatus.name != 'module-loader-test-module' || installStatus.version != '0.0.1')
				throw new Error('Wrong installation metadata');
			else
				done();

		});

	});

	it('should load a module that is installed', function(done) {

		var modules = {};

		// Load three modules
		// Module 1 depends on Module 2 and 3 (available as test2, test3)
		modules.test1 = {
			require: 'module-loader-test-module',
			argument: {
				whoami: 'test1',
				callback: loadCallback
			},
			required: {
				test2: 'test2',
				test3: 'test3'
			}
		};

		modules.test2 = {
			require: 'module-loader-test-module',
			argument: {
				whoami: 'test2',
				callback: loadCallback
			},
			required: {
				test3: 'test3'
			}
		};

		modules.test3 = {
			require: 'module-loader-test-module',
			argument: {
				whoami: 'test3',
				callback: loadCallback
			}
		};

		var loadOrder = ['test3', 'test2', 'test1'];
		var loader = ModuleLoader();
		var modulesLoaded = loader.load(modules);

		function loadCallback(whoami) {
			if(loadOrder[0] != whoami)
				throw new Error("Wrong load order");

			loadOrder.shift();
		}

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
	});

});
