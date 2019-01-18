class TestModule {
	constructor(whoami, callback, modules) {
		this.whoami = whoami;
		this.modules = modules;

		if(typeof callback === 'function')
			callback(whoami);
	}
}

export default TestModule;
