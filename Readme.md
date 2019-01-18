# Module Loader #
Module loader, with a dependency graph

## Usage ##

	const TestModule = require('module-loader-test-module');
	
	var modules = {};
    
	// Load three modules
	// Module 1 depends on Module 2 and 3 (available as test2, test3)
	// argument option is passed to modules
	
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
