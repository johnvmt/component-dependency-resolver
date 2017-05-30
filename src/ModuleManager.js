var Utils = require('./Utils');

function ModuleManager(config) {

	// TODO move these to make this work in the browser
	this.moduleInstaller = require('./ModuleInstaller')();
	this.moduleLoader = require('./ModuleLoader')();

	this._modulesLoaded = {};
}

ModuleManager.prototype.installModules = function(modulesConfig, callback) {
	var moduleInstaller = this.moduleInstaller;
	var installsInProgress = 0;
	var installStatus = {};
	Utils.objectForEach(modulesConfig, function(moduleConfig, moduleKey) {
		if(typeof moduleConfig.npm != 'undefined' && typeof moduleConfig.require != 'string') {
			installsInProgress++;
			moduleInstaller.installNpmModule(moduleConfig.npm, function(error, installMetadata) {
				installsInProgress--;
				installStatus[moduleKey] = {error: error, install: installMetadata};
				if(!error)
					moduleConfig.require = installMetadata.name; // TODO move me
				if(installsInProgress == 0)
					callback(installStatus);
			});
		}
	});
	if(installsInProgress == 0)
		callback(installStatus);
};

ModuleManager.prototype.loadModules = function(modulesConfig, callback) {
	var core = this;
	try {
		this.moduleLoader.load(modulesConfig, core._modulesLoaded);
		callback(null, core._modulesLoaded);
	}
	catch(error) {
		callback(error, core._modulesLoaded);
	}
};

ModuleManager.prototype.installLoadModules = function(modulesConfig, callback) {
	// check cache
	var core = this;
	core.installModules(modulesConfig, function(installStatus) {
		var errors = false;
		Utils.objectForEach(installStatus, function(moduleInstallStatus) {
			if(moduleInstallStatus.error != null)
				errors = true;
		});


		if(errors)
			callback(installStatus, null);
		else
			core.loadModules(modulesConfig, callback);
	});
};

module.exports = function(config) {
	return new ModuleManager(config);
};