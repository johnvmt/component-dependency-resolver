var assert = require('assert');
var path = require('path');
var ModuleInstaller = require('../src/ModuleInstaller');

describe('Module Installer Functions', function() {
	it('should install a module that exists', function(done) {

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

	it('should try to install a module that does not exist', function(done) {

		this.timeout(20000); // Allow 20 seconds for this to complete

		var installer = ModuleInstaller();

		installer.installNpmModule('file:' + path.join(__dirname, 'module-loader-test-module-doesnotexist'), function(error, installStatus) {
			if(error) {
				var mod = require('module-loader-test-module');
				done();
			}
			else
				throw new Error('Did not throw error, when package did not exist');
		});
	});
});