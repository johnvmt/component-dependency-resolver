const assert = require('assert');
const path = require('path');
const ModuleLoader = require('../');
const TestModule = require('module-loader-test-module');

describe('Module Installer Functions', function() {
	it('should load a module that is installed', function(done) {
		const modulesConfig = {
			test1: {
				loader: (modules) => new TestModule('test1', loadCallback, modules),
				required: {
					test2: 'test2',
					test3: 'test3'
				}
			},
			test2: {
				loader: (modules) => new TestModule('test2', loadCallback, modules),
				required: {
					test3: 'test3'
				}
			},
			test3: {
				loader: (modules) => new TestModule('test3', loadCallback, modules)
			}
		};

		const loadOrder = ['test3', 'test2', 'test1'];
		const loader = new ModuleLoader();
		const modulesLoaded = loader.load(modulesConfig);

		for(let moduleKey in modulesConfig) {
			if(typeof modulesLoaded[moduleKey] === 'undefined')
				throw new Error('Module not in loaded list');

			if(modulesLoaded[moduleKey].whoami !== moduleKey)
				throw new Error('Module\'s whoami does not match');

			let dependentModules = modulesLoaded[moduleKey].modules;
			for(let dependentModuleKey in modulesLoaded[moduleKey].modules) {
				if(typeof dependentModules[dependentModuleKey] === 'undefined')
					throw new Error('Dependent module not found');
			}
		}

		if(loadOrder.length)
			throw new Error("Module load callbacks not called");

		done();

		function loadCallback(whoami) {
			if(loadOrder[0] !== whoami)
				throw new Error("Wrong load order");

			loadOrder.shift();
		}
	});

});
