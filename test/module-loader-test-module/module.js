module.exports = function(moduleConfig, modules) {

	if(typeof moduleConfig.callback == 'function')
		moduleConfig.callback(moduleConfig.whoami);

	return {
		whoami: function() {
			return moduleConfig.whoami;
		},
		modules: function() {
			return modules;
		}
	}
};