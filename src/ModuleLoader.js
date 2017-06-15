var Utils = require('./Utils');
var Graph = require('./Graph');

function ModuleLoader(config) {
	this.config = config;

}

/**
 *
 * @param [moduleKey]
 * @param modulesConfig
 * @param [modulesLoaded]
 */
ModuleLoader.prototype.load = function() {
	var parsedArgs = Utils.parseArgs(
		arguments,
		[
			{name: 'moduleKey', level: 1,  validate: function(arg, allArgs) { return typeof arg == 'string'; }},
			{name: 'modulesConfig', level: 0,  validate: function(arg, allArgs) { return typeof arg == 'object'; }},
			{name: 'modulesLoaded', level: 1,  validate: function(arg, allArgs) { return typeof arg == 'object' && arg != null; }, default: {}}
		]
	);

	var dependencyGraph = this._dependencyGraph(parsedArgs.modulesConfig);

	if(typeof parsedArgs.moduleKey == 'string')
		dependencyGraph.depthFirstTraverse(parsedArgs.moduleKey, loadModule);
	else
		dependencyGraph.depthFirstTraverse(loadModule);

	return parsedArgs.modulesLoaded;

	function loadModule(moduleConfig, moduleKey) {
		// Get all modules to be passed to module
		var dependentModules = {};
		if(typeof moduleConfig.required == 'object' && moduleConfig.required != null) { // Iterate over module dependencies
			Utils.objectForEach(moduleConfig.required, function(dependencyModuleKey, dependencyInternalKey) {
				dependentModules[dependencyInternalKey] = parsedArgs.modulesLoaded[dependencyModuleKey];
			});
		}

		var moduleFunction = typeof moduleConfig.function == 'function' ? moduleConfig.function : require(moduleConfig.require);

		// TODO add try/catch
		parsedArgs.modulesLoaded[moduleKey] = moduleFunction(moduleConfig.argument, dependentModules);
	}
};

ModuleLoader.prototype._dependencyGraph = function(modulesConfig) {
	var dependencyGraph = Graph();

	Utils.objectForEach(modulesConfig, function(moduleConfig, moduleKey) {// Iterate over modules in config
		dependencyGraph.addNode(moduleKey, moduleConfig); // Add each module to graph
	});

	Utils.objectForEach(modulesConfig, function(moduleConfig, moduleKey) {// Iterate over modules in config
		if(typeof moduleConfig.required == 'object' && moduleConfig.required != null) { // Iterate over module dependencies
			Utils.objectForEach(moduleConfig.required, function (dependencyModuleKey) {
				dependencyGraph.addEdge(moduleKey, dependencyModuleKey); // Add each module to graph
			});
		}
	});

	return dependencyGraph;
};

module.exports = function(config) {
	return new ModuleLoader(config);
};