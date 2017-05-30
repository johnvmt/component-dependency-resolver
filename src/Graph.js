function Graph() {
	this._nodes = {};
}

Graph.prototype.getNode = function(key) {
	if(!this.hasNode(key))
		throw new Error('node_undefined');
	else
		return this._nodes[key].data;
};

Graph.prototype.addNode = function(key, data) {
	if(this.hasNode(key))
		throw new Error('node_exists');
	else
		this._nodes[key] = {data: data, indegree: 0, edges: []};
};

Graph.prototype.hasNode = function(key) {
	return (typeof this._nodes[key] != 'undefined');
};

Graph.prototype.addEdge = function(sourceNodeKey, sinkNodeKey) {
	if(!this.hasNode(sourceNodeKey))
		throw new Error('source_node_undefined');
	else if(!this.hasNode(sinkNodeKey))
		throw new Error('sink_node_undefined');
	else {
		var sourceNodeEdges = this._nodes[sourceNodeKey].edges;
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
};

Graph.prototype.depthFirstTraverse = function() {
	if(arguments.length == 1)
		var callback = arguments[0];
	else if(arguments.length == 2) {
		var sourceNodeKey = arguments[0];
		var callback = arguments[1];
	}
	else if(arguments.length == 3) {
		var sourceNodeKey = arguments[0];
		var visitedNodes = arguments[1];
		var callback = arguments[2];
	}
	else
		throw new Error('invalid_arguments');

	if(typeof visitedNodes == 'undefined')
		var visitedNodes = {};

	if(typeof sourceNodeKey == 'undefined') {
		// Start with nodes with indegree 0
		for(var nodeKey in this._nodes) {
			if (this._nodes.hasOwnProperty(nodeKey) && this._nodes[nodeKey].indegree == 0)
				this.depthFirstTraverse(nodeKey, visitedNodes, callback);
		}
	}
	else if(typeof this._nodes[sourceNodeKey] == 'object') {
		if(typeof visitedNodes[sourceNodeKey] != 'boolean' || !visitedNodes[sourceNodeKey]) {
			visitedNodes[sourceNodeKey] = true;
			for(var index in this._nodes[sourceNodeKey].edges) {
				this.depthFirstTraverse(this._nodes[sourceNodeKey].edges[index], visitedNodes, callback);
			}
			callback(this._nodes[sourceNodeKey].data, sourceNodeKey);
		}
	}
	else {
		console.log(sourceNodeKey);
		throw new Error('undefined_node');
	}
};

Graph.prototype.hasCycle = function(sourceNodeKey, visited) {
	if(!this.hasNode(sourceNodeKey))
		throw new Error('source_node_undefined');
	else {
		var sourceNode = this._nodes[sourceNodeKey];

		if(typeof visited == 'undefined' || !Array.isArray(visited))
			visited = [];

		if(visited.indexOf(sourceNodeKey) >= 0)
			return true;

		visited.push(sourceNodeKey);

		for(var index in sourceNode.edges) {
			var visitedClone = visited.slice(0);
			if(this.hasCycle(sourceNode.edges[index], visitedClone))
				return true;
		}
		return false;
	}
};

module.exports = function() {
	return new Graph();
};