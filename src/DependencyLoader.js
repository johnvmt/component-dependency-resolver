import DirectedGraph from "./DirectedGraph.js";
import ExtendedError from "./ExtendedError.js";

class DependencyLoader {
    constructor(keys, dependencyKeys, loader) {
        this._keys = keys;
        this._getKeysDependencies = dependencyKeys;
        this._load = loader;
        this._graph = new DirectedGraph({acyclic: true});
    }

    /**
     * Load scripts and dependencies from starting list of script keys
     * @param keys
     * @returns {Promise<void>}
     */
    async load(keys = this._keys) {
        // TODO lock during load
        await this.loadDependencyGraph(keys);
        await this.loadFromGraph();
    }

    loadFromGraph() {
        return this._graph.traverse((...args) => this._load(...args));
    }

    /**
     * Load script configs into graph, resolving dependencies and loading their configs
     * @param keys
     * @returns {Promise<void>}
     */
    async loadDependencyGraph(keys) {
        let keysToAdd = Array.from(new Set(keys)); // eliminate duplicates and normalize to array
        let dependenciesToAdd = [];

        // continue loading keys and dependencies until there are no more queued
        while(keysToAdd.length || dependenciesToAdd.length) {
            // add each key to graph as a node
            for(let key of keysToAdd) {
                this._graph.add(key);
            }

            // add each dependency to graph as an edge
            for(let [key, dependencyKey] of dependenciesToAdd) {
                if(!this._graph.hasEdge(key, dependencyKey)) // prevent duplicates error
                    this._graph.addEdge(key, dependencyKey); // add dependency as edge to graph
            }

            // get dependencies for keys just added to the graph
            const addedKeysDependencies = await this._getKeysDependencies(Array.from(keysToAdd));

            const keysToAddNextLoopSet = new Set();
            const dependenciesToAddNextLoop = [];

            if(keysToAdd.length !== addedKeysDependencies.length) // check number of configs requested = number returned
                throw new ExtendedError(`Mismatch between number of configs requested (${keysToAdd.length}) and configs returned (${addedKeysDependencies.length})`, {code: 'config_length_mismatch'});

            // add keys and dependencies to the graph in the next loop
            for(let index = 0; index < addedKeysDependencies.length; index++) {
                const key = keysToAdd[index];
                const dependencyKeys = addedKeysDependencies[index];

                // loop over dependency
                for(let dependencyKey of dependencyKeys) {
                    // add dependency key to the set of unique keys to add to the graph next loop
                    if(!this._graph.has(dependencyKey))
                        keysToAddNextLoopSet.add(dependencyKey);

                    // add each dependency to the array of edges to add to the graph next loop
                    dependenciesToAddNextLoop.push([key, dependencyKey]);
                }
            }

            keysToAdd = Array.from(keysToAddNextLoopSet);
            dependenciesToAdd = dependenciesToAddNextLoop;
        }
    }
}

export default DependencyLoader;
