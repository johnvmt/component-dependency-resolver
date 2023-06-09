import path from "node:path";

import Component from "./Component.js";
import DependencyLoader from "./DependencyLoader.js";
import ExtendedError from "./ExtendedError.js";

class ComponentLoader {
    /**
     * Implementation of dependency loader using a Component class to hold configs
     * @param componentNames
     * @param componentDirectory
     */
    constructor(componentNames, componentDirectory) {
        this._componentNames = componentNames;
        this._componentDirectory = componentDirectory;
        this._componentConfigsByName = {};
        this._componentsByName = {};

        this._dependencyLoader = new DependencyLoader(componentNames, (componentNames) => this.componentsDependencyNames(componentNames), (componentNames) => this.initializeComponents(componentNames));
    }

    /**
     * Returns an object of components by name
     * @returns {unknown[]}
     */
    get components() {
        return this._componentsByName;
    }

    /**
     * Resolve dependencies and call constructors for all components
     * @returns {Promise<void>}
     */
    async load() {
        await this._dependencyLoader.load(this._componentNames);
        return this._componentsByName;
    }

    /**
     * Returns true if component class is already loaded
     * @param componentName
     * @returns {boolean}
     */
    cacheHasComponentConfig(componentName) {
        return (componentName in this._componentConfigsByName);
    }

    /**
     * Get component class from cache
     * @param componentName
     * @returns {*}
     */
    loadComponentConfigFromCache(componentName) {
        if(!this.cacheHasComponentConfig(componentName))
            throw new ExtendedError(`Component ${componentName} not in cache`, {code: 'component_not_in_cache'});

        return this._componentConfigsByName[componentName];
    }

    /**
     * Load component class from a file in the component directory and add it to the cache
     * Can be overriden by class that inherit from this one
     * @param componentName
     * @returns {Promise<*|boolean>}
     */
    async loadComponentConfigFromFile(componentName) {
        // TODO use glob to get any version (mjs, js, cjs)
        const componentPath = path.join(this._componentDirectory, `${componentName}.js`);
        const componentExports = (await import(componentPath));

        // import and use default export
        if(!('default' in componentExports))
            throw new ExtendedError(`default export not found in ${componentName}`, {code: 'component_default_export'});

        const componentConfig = componentExports.default;

        if(!(componentConfig.prototype instanceof Component))
            throw new ExtendedError(`component ${componentName} is not an instance of Component`, {code: 'component_invalid'});

        // add to cache
        this._componentConfigsByName[componentName] = componentConfig;

        return componentConfig;
    }

    /**
     * Load single component class from cache or file
     * @param componentName
     * @returns {Promise<Promise<*>|Promise<*|boolean>>}
     */
    async loadComponentConfig(componentName) {
        return this.cacheHasComponentConfig(componentName)
            ? this.loadComponentConfigFromCache(componentName)
            : this.loadComponentConfigFromFile(componentName);
    }

    /**
     * Load multiple component classes, return in order requested
     * @param componentNames
     * @returns {Promise<Awaited<unknown>[]>}
     */
    async loadComponentConfigs(componentNames) {
        return Promise.all(componentNames.map(componentName => this.loadComponentConfig(componentName)))
    };

    /**
     * Get names (keys) of components required by named component
     * @param componentName
     * @returns {Promise<[]|string[]|*|*[]>}
     */
    async componentDependencyNames(componentName) {
        const componentConfig = await this.loadComponentConfig(componentName);
        return ComponentLoader.dependenciesFromComponentConfig(componentConfig);
    }

    /**
     * Get names (keys) of components required by named components, return in order requested
     * @param componentNames
     * @returns {Promise<unknown[]>}
     */
    componentsDependencyNames(componentNames) {
        return Promise.all(componentNames.map(componentName => this.componentDependencyNames(componentName)));
    }

    /**
     * Return component dependencies as object
     * @param componentName
     * @returns {Promise<T>}
     */
    async componentDependencies(componentName) {
        const componentDependencyNames = await this.componentDependencyNames(componentName);
        return componentDependencyNames.reduce((componentDependencies, componentDependencyName) => {
            return {
                ...componentDependencies,
                [componentDependencyName]: this._componentsByName[componentDependencyName]
            }
        }, {});
    }

    /**
     * get args to pass to component constructor
     * @param componentName
     * @returns {Promise<T[]>}
     */
    async componentConstructorArgs(componentName) {
        const componentDependencies = await this.componentDependencies(componentName);

        return [componentDependencies];
    }

    /**
     * Call constructor for named component, passing in dependencies
     * @param componentName
     * @returns {Promise<void>}
     */
    async initializeComponent(componentName) {
        const componentConstructorArgs = await this.componentConstructorArgs(componentName);
        const componentClass = this._componentConfigsByName[componentName];
        this._componentsByName[componentName] = new componentClass(...componentConstructorArgs);
    }

    /**
     * Call constructors for all named components, passing in dependencies
     * @param componentNames
     * @returns {Promise<Awaited<unknown>[]>}
     */
    async initializeComponents(componentNames) {
        return Promise.all(componentNames.map(componentName => this.initializeComponent(componentName)));
    }

    /**
     *
     * @param componentConfig
     * @returns {[]|[string]|string[]|[string]|[string]|[string]|*|*[]}
     */
    static dependenciesFromComponentConfig(componentConfig) {
        return componentConfig.dependencies ?? [];
    }
}

export default ComponentLoader;
