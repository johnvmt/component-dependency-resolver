# Module Installer and Laoder #
Module installer (via NPM) and loader

## Usage ##

	var modules = {};
	
	modules.test1 = {
		npm: 'file:./test/module-loader-test-module',
		argument: {
			key: 'value1'
		},
		modules: {
			test2: 'test2',
			test3: 'test3'
		}
	};
	
	modules.test2 = {
		npm: 'file:./test/module-loader-test-module',
		argument: {
			key: 'value2'
		},
		modules: {
			test3: 'test3'
		}
	};
	
	modules.test3 = {
		npm: 'file:./test/module-loader-test-module',
		argument: {
			key: 'value3'
		}
	};
	
	modules.test4 = {
		npm: 'file:./test/module-loader-test-module',
		argument: {
			key: 'value3'
		}
	};
	
	var moduleManager = require('module-installer-loader')();
	
	moduleManager.installLoad(modules, function(error, modulesLoaded) {
		if(error)
			console.log("ERROR");
		else
			console.log(modulesLoaded);
		//console.log(error, modulesLoaded);
		//console.log(modules);
	});