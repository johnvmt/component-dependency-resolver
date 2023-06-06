# Dependency Resolver #
Dependency loader, using a graph to resolve component/dependency relationships and load components in order

## Usage ##

### Generic Dependency Loader ###

### Component Loader ###

#### Example Component ####

    import { Component } from "dependency-resolver";
    
    class AComponent extends AppComponent {
    constructor(...args) {
    super(...args);
    }
    
        static dependencies = ['b', 'c'];
    }
    
    export default AComponent;


    import { ComponentLoader } from "dependency-resolver";
    import path from "path";
    import { fileURLToPath } from 'url';
    
    (async () => {
    const componentsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'src/components');
    const loader = new ComponentLoader(['a'], componentsDir);
        const components = await loader.load();
        console.log(components);
    })();