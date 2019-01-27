class Graph {
	constructor() {
		this._nodes = {};
	}

	getNode(key) {
		if(!this.hasNode(key))
			throw new Error('node_undefined');
		else
			return this._nodes[key].data;
	}

	addNode(key, data) {
		if(this.hasNode(key))
			throw new Error('node_exists');
		else
			this._nodes[key] = {data: data, indegree: 0, edges: []};
	}

	hasNode(key) {
		return (typeof this._nodes[key] !== 'undefined');
	}

	addEdge(sourceNodeKey, sinkNodeKey) {
		if(!this.hasNode(sourceNodeKey))
			throw new Error('source_node_undefined');
		else if(!this.hasNode(sinkNodeKey))
			throw new Error('sink_node_undefined');
		else {
			let sourceNodeEdges = this._nodes[sourceNodeKey].edges;
			if(sourceNodeEdges.indexOf(sinkNodeKey) < 0) {
				sourceNodeEdges.push(sinkNodeKey);
				if(this.hasCycle(sinkNodeKey)) {
					sourceNodeEdges.pop();
					throw new Error('graph_cycle');
				}
				else
					this._nodes[sinkNodeKey].indegree++;
			}
		}
	}

	depthFirstTraverse(nodeCallback, sourceNodeKey = null, visitedNodes = {}) {
		if(sourceNodeKey === null) {
			// Start with nodes with indegree 0
			for(let nodeKey in this._nodes) {
				if (this._nodes.hasOwnProperty(nodeKey) && this._nodes[nodeKey].indegree === 0)
					this.depthFirstTraverse(nodeCallback, nodeKey, visitedNodes);
			}
		}
		else if(typeof this._nodes[sourceNodeKey] === 'object') {
			if(typeof visitedNodes[sourceNodeKey] !== 'boolean' || !visitedNodes[sourceNodeKey]) {
				visitedNodes[sourceNodeKey] = true;
				for(let index in this._nodes[sourceNodeKey].edges) {
					this.depthFirstTraverse(nodeCallback, this._nodes[sourceNodeKey].edges[index], visitedNodes);
				}
				nodeCallback(this._nodes[sourceNodeKey].data, sourceNodeKey);
			}
		}
		else {
			console.log(sourceNodeKey);
			throw new Error('undefined_node');
		}
	}

	hasCycle(sourceNodeKey, visited) {
		if(!this.hasNode(sourceNodeKey))
			throw new Error('source_node_undefined');
		else {
			let sourceNode = this._nodes[sourceNodeKey];

			if(typeof visited === 'undefined' || !Array.isArray(visited))
				visited = [];

			if(visited.indexOf(sourceNodeKey) >= 0)
				return true;

			visited.push(sourceNodeKey);

			for(let index in sourceNode.edges) {
				let visitedClone = visited.slice(0);
				if(this.hasCycle(sourceNode.edges[index], visitedClone))
					return true;
			}
			return false;
		}
	}
}

export default Graph;
