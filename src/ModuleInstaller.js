var npm = require('npm');
var path = require('path');
var Utils = require('./Utils');

function ModuleInstaller() {}

/**
 * Install NPM module specified by npmPkg
 * @param npmPkg
 * @param [basedir]
 * @param callback
 */
ModuleInstaller.prototype.installNpmModule = function() {
	var parsedArgs = Utils.parseArgs(
		arguments,
		[
			{name: 'npmPkg', level: 0,  validate: function(arg, allArgs) { return typeof arg == 'string'; }},
			{name: 'basedir', level: 1,  validate: function(arg, allArgs) { return typeof arg == 'string'; }},
			{name: 'callback', level: 0,  validate: function(arg, allArgs) { return typeof(arg) === 'function'; }}
		]
	);

	if(typeof parsedArgs.npmPkg  == 'undefined' || typeof parsedArgs.callback == 'undefined')
		throw new Error("invalid_args");

	npm.load(
		{
			loaded: false
		},
		function (err) {
			if(err)
				callback(err, null);
			else {
				try {
					if(typeof parsedArgs.basedir == 'undefined')
						npm.commands.install([parsedArgs.npmPkg], afterInstall);
					else
						npm.commands.install(parsedArgs.basedir, [parsedArgs.npmPkg], afterInstall);
				}
				catch(error) {
					parsedArgs.callback(error, null);
				}
			}
		}
	);

	function afterInstall(error, response) {
		if(error)
			parsedArgs.callback(error, null);
		else {
			var pkgInstalled = response.pop();

			var installMetadata = parseResponseArray(pkgInstalled);

			// Add dependencies, if any
			if(response.length > 0) {
				installMetadata.dependencies = [];
				response.forEach(function(dependency) {
					installMetadata.dependencies.push(parseResponseArray(dependency));
				});
			}

			parsedArgs.callback(error, installMetadata);
		}
	}

	function parseResponseArray(responseArray) {
		// [ [packageName@version] [Install Location]
		return {
			name: responseArray[0].split('@')[0],
			version: responseArray[0].split('@')[1],
			path: responseArray[1]

		}
	}
};

module.exports = function() {
	return new ModuleInstaller();
};