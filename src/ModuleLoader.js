import Graph from './Graph';

class ModuleLoader {



	load(modulesConfig, moduleKey = null, modulesLoaded = {}) {

		let dependencyGraph = ModuleLoader.dependencyGraph(modulesConfig);

		if(moduleKey !== null)
			dependencyGraph.depthFirstTraverse(moduleKey, loadModule);
		else
			dependencyGraph.depthFirstTraverse(loadModule);

		return modulesLoaded;

		function loadModule(moduleConfig, moduleKey) {
			// Get all modules to be passed to module
			let dependentModules = {};
			if(typeof moduleConfig.required === 'object' && moduleConfig.required !== null) { // Iterate over module dependencies
				for(let dependencyInternalKey in moduleConfig.required) {
					if(moduleConfig.required.hasOwnProperty(dependencyInternalKey)) {
						let dependencyModuleKey = moduleConfig.required[dependencyInternalKey];
						if(!modulesLoaded.hasOwnProperty(dependencyModuleKey))
							throw new Error('module_undefined: ' + dependencyModuleKey);
						else
							dependentModules[dependencyInternalKey] = modulesLoaded[dependencyModuleKey];
					}
				}
			}

			modulesLoaded[moduleKey] = moduleConfig.loader(dependentModules);
		}
	}

	static dependencyGraph(modulesConfig) {
		let dependencyGraph = new Graph();

		for(let moduleKey in modulesConfig) {
			if(modulesConfig.hasOwnProperty(moduleKey))
				dependencyGraph.addNode(moduleKey, modulesConfig[moduleKey]); // Add each module to graph
		}

		for(let moduleKey in modulesConfig) {
			if(modulesConfig.hasOwnProperty(moduleKey)) {
				let moduleConfig = modulesConfig[moduleKey];

				if(typeof moduleConfig.required === 'object' && moduleConfig.required !== null) { // Iterate over module dependencies
					for(let dependencyModuleKey in moduleConfig.required) {
						if(moduleConfig.required.hasOwnProperty(dependencyModuleKey))
							dependencyGraph.addEdge(moduleKey, dependencyModuleKey); // Add each module to graph
					}
				}
			}
		}

		return dependencyGraph;
	}
}

export default ModuleLoader;
