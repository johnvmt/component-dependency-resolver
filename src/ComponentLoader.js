import path from "node:path";

import Component from "./Component.js";
import DependencyLoader from "./DependencyLoader.js";
import ExtendedError from "./ExtendedError.js";

class ComponentLoader {
    constructor(componentNames, componentDirectory) {
        this._componentNames = componentNames;
        this._componentDirectory = componentDirectory;
        this._componentClassesByName = {};
        this._componentsByName = {};

        this._dependencyLoader = new DependencyLoader(componentNames, (componentNames) => this.componentsDependencyNames(componentNames), (componentNames) => this.startComponents(componentNames));
    }

    /**
     * Resolve dependencies and call constructors for all components
     * @returns {Promise<void>}
     */
    async load() {
        await this._dependencyLoader.load(this._componentNames);
        return Object.freeze(this._componentsByName);
    }

    /**
     * Returns true if component class is already loaded
     * @param componentName
     * @returns {boolean}
     */
    cacheHasComponentClass(componentName) {
        return (componentName in this._componentClassesByName);
    }

    /**
     * Get component class from cache
     * @param componentName
     * @returns {*}
     */
    loadComponentClassFromCache(componentName) {
        if(!this.cacheHasComponentClass(componentName))
            throw new ExtendedError(`Component ${componentName} not in cache`, {code: 'component_not_in_cache'});

        return this._componentClassesByName[componentName];
    }

    /**
     * Load component class from a file in the component directory and add it to the cache
     * @param componentName
     * @returns {Promise<*|boolean>}
     */
    async loadComponentClassFromFile(componentName) {
        // TODO use glob to get any version (mjs, js, cjs)
        const componentPath = path.join(this._componentDirectory, `${componentName}.js`);
        const componentExports = (await import(componentPath));

        // import and use default export
        if(!('default' in componentExports))
            throw new ExtendedError(`default export not found in ${componentName}`, {code: 'component_default_export'});

        const componentClass = componentExports.default;

        if(!(componentClass.prototype instanceof Component))
            throw new ExtendedError(`component ${componentName} is not an instance of Component`, {code: 'component_invalid'});

        // add to cache
        this._componentClassesByName[componentName] = componentClass;

        return componentClass;
    }

    /**
     * Load single component class from cache or file
     * @param componentName
     * @returns {Promise<Promise<*>|Promise<*|boolean>>}
     */
    async loadComponentClass(componentName) {
        return this.cacheHasComponentClass(componentName)
            ? this.loadComponentClassFromCache(componentName)
            : this.loadComponentClassFromFile(componentName);
    }

    /**
     * Load multiple component classes, return in order requested
     * @param componentNames
     * @returns {Promise<Awaited<unknown>[]>}
     */
    async loadComponentClasses(componentNames) {
        return Promise.all(componentNames.map(componentName => this.loadComponentClass(componentName)))
    };

    /**
     * Get names (keys) of components required by named component
     * @param componentName
     * @returns {Promise<[]|string[]|*|*[]>}
     */
    async componentDependencyNames(componentName) {
        const componentClass = await this.loadComponentClass(componentName);
        return ComponentLoader.dependenciesFromComponentClass(componentClass);
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
     * get args to pass to component constructor
     * @param componentName
     * @returns {Promise<T[]>}
     */
    async componentConstructorArgs(componentName) {
        const componentDependencyNames = await this.componentDependencyNames(componentName);
        const componentDependencies = componentDependencyNames.reduce((componentDependencies, componentDependencyName) => {
            return {
                ...componentDependencies,
                [componentDependencyName]: this._componentsByName[componentDependencyName]
            }
        }, {});

        return [componentDependencies];
    }

    /**
     * Call constructor for named component, passing in dependencies
     * @param componentName
     * @returns {Promise<void>}
     */
    async startComponent(componentName) {
        const componentConstructorArgs = await this.componentConstructorArgs(componentName);
        const componentClass = this._componentClassesByName[componentName];
        this._componentsByName[componentName] = new componentClass(...componentConstructorArgs);
    }

    /**
     * Call constructors for all named components, passing in dependencies
     * @param componentNames
     * @returns {Promise<Awaited<unknown>[]>}
     */
    async startComponents(componentNames) {
        return Promise.all(componentNames.map(componentName => this.startComponent(componentName)));
    }

    /**
     *
     * @param componentClass
     * @returns {[]|[string]|string[]|[string]|[string]|[string]|*|*[]}
     */
    static dependenciesFromComponentClass(componentClass) {
        return componentClass.dependencies ?? [];
    }
}

export default ComponentLoader;
