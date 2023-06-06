import ExtendedError from "./ExtendedError.js";
import GraphNode from "./GraphNode.js";

class DirectedGraph {
	constructor(options = {}) {
		// TODO validate options
		this._options = {
			acyclic: true,
			...options
		};

		this._nodes = new Map();
		this._nodeKeys = new Map();
	}

	get acyclic() {
		return this._options.acyclic;
	}

	/**
	 * Return true if node with specified key exists, false otherwise
	 * @param key
	 * @returns {boolean}
	 */
	has(key) {
		return this._nodes.has(key);
	}

	/**
	 * Returns node with specified key, or throws an error if the node does not exist
	 * @param key
	 * @returns {*}
	 */
	node(key) {
		if(!this.has(key))
			throw new Error(`Node ${key} is not in graph`, {code: 'node_undefined'});

		return this._nodes.get(key);
	}

	/**
	 * Add a node
	 * @param key
	 */
	add(key) {
		if(this.has(key))
			throw new Error(`Node ${key} already exists`, {code: 'node_exists'});
		else {
			const node = new GraphNode();
			this._nodes.set(key, node);
			this._nodeKeys.set(node, key);
		}
	}

	/**
	 * Returns true if both nodes exist and there is an edge from the source to the sink, false otherwise
	 * @param sourceNodeKey
	 * @param sinkNodeKey
	 * @returns {false|*}
	 */
	hasEdge(sourceNodeKey, sinkNodeKey) {
		return this.has(sourceNodeKey) && this.has(sinkNodeKey) && this.node(sourceNodeKey).hasEdge(this.node(sinkNodeKey));
	}

	/**
	 * Creates an edge froma  source to a sink node; throws an error if the nodes do not exist or if the edge already exists
	 * @param sourceNodeKey
	 * @param sinkNodeKey
	 */
	addEdge(sourceNodeKey, sinkNodeKey) {
		if(!this.has(sourceNodeKey))
			throw new ExtendedError(`Source node ${sourceNodeKey} not in graph`, {code: 'source_node_undefined'});
		else if(!this.has(sinkNodeKey))
			throw new ExtendedError(`Sink node ${sourceNodeKey} not in graph`, {code: 'sink_node_undefined'});

		const sourceNode = this.node(sourceNodeKey);
		const sinkNode = this.node(sinkNodeKey);

		sourceNode.addEdge(sinkNode);

		if(this.acyclic && this.hasCycle(sourceNode)) {
			sourceNode.removeEdge(sinkNode);
			throw new ExtendedError(`Edge creates cycle in graph`, {code: 'graph_cycle'});
		}
	}

	/**
	 * Rename node key, maintaining graph edges
	 * @param oldKey
	 * @param newKey
	 */
	rename(oldKey, newKey) {
		const node = this.node(oldKey);
		this._nodes.delete(oldKey);
		this._nodes.set(newKey, node);
		this._nodeKeys.set(node, newKey);
	}

	/**
	 * Traverse nodes, breadth-first, bottom-up
	 * Modified Kahn's algorithm
	 * @param callback
	 * @returns {Promise<void>}
	 */
	async traverse(callback) {
		const remainingNodeOutdegrees = new Map();

		// set initial indegree
		const startingNodes = [];
		for(let node of this._nodes.values()) {
			// start from nodes whose outdegree is 0
			if(node.outdegree === 0)
				startingNodes.push(node);
			else
				remainingNodeOutdegrees.set(node, node.outdegree);
		}

		// traverse graph starting from nodes in arg
		const traverseFromNodes = async (sinkNodes) => {
			const zeroOutdegreeSourceNodes = [];

			// find neighbor nodes with edges pointing to this node, whose outdegree after visiting this node will be 0
			for(let sinkNode of sinkNodes) {
				for(let sourceNode of sinkNode._incomingEdges) {
					const sourceNodeOutdegree = remainingNodeOutdegrees.get(sourceNode);

					if(sourceNodeOutdegree === 1) { // source node will have no outdegree after visit
						zeroOutdegreeSourceNodes.push(sourceNode); // visit source node in next cycle
						remainingNodeOutdegrees.delete(sourceNode); // remove source node from graph of remaining nodes
					}
					else // source node still has remaining outdegree after visit (do not visit next cycle)
						remainingNodeOutdegrees.set(sourceNode, sourceNodeOutdegree - 1); // reduce source node outdegree due to visit
				}
			}

			await callback(sinkNodes.map(node => this._nodeKeys.get(node))); // visit nodes (emit keys)

			if(zeroOutdegreeSourceNodes.length > 0)
				await traverseFromNodes(zeroOutdegreeSourceNodes);
			else if(remainingNodeOutdegrees.size > 0) // nodes remain to be traversed, but none with outdegree = 0
				throw new ExtendedError(`Cannot traverse cyclic graphs`, {code: 'cyclic_graph'});
		}

		if(startingNodes.length === 0) // no nodes to start from
			throw new ExtendedError(`Cannot traverse cyclic graphs`, {code: 'cyclic_graph'});

		// start from nodes whose outdegree is 0
		await traverseFromNodes(startingNodes);
	}

	/**
	 * Check if graph contains a cycle, when starting from one node
	 * @param startingNode
	 * @returns {boolean}
	 */
	hasCycle(startingNode) {
		/**
		 * Internal function to keep visitedNodes argument hidden
		 * @param startingNode
		 * @param visitedNodes
		 * @returns {boolean}
		 */
		const hasCycleFromNode = (startingNode, visitedNodes = new Set()) => {
			if(visitedNodes.has(startingNode))
				return true;

			visitedNodes.add(startingNode);

			for(let neighborNode of startingNode.edges) {
				if(hasCycleFromNode(neighborNode, new Set(visitedNodes)))
					return true;
			}
			return false;
		}

		return hasCycleFromNode(startingNode);
	}
}

export default DirectedGraph;
