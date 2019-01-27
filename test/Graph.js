const assert = require('assert');
const Graph = require('esm')(module)('../src/Graph').default;

describe('Graph Functions', function() {
	describe('Add Node - Normal', function() {
		it('should insert a node that does not already exist', function(done) {
			let g = new Graph();

			let nodeData = {dataKey: 'dataVal'};
			let nodeKey = 'key';
			g.addNode(nodeKey, nodeData);
			if(g.getNode(nodeKey) === nodeData)
				done();
			else
					throw new Error('Wrong data found on get');
		});
	});

	describe('Add Node - Duplicate', function() {
		it('should insert a node that already exists in the graph', function(done) {
			let g = new Graph();

			let nodeData = {dataKey: 'dataVal'};
			let nodeKey = 'key';
			g.addNode(nodeKey, nodeData);
			if(g.getNode(nodeKey) === nodeData) {
				try {
					g.addNode(nodeKey, nodeData);
				}
				catch(error) {
					if(error.message === 'node_exists')
						done();
					else
						throw error;
				}

			}
			else
				throw new Error('Wrong data found on get');
		});
	});

	describe('Has Node - Exists', function() {
		it('should try to find a node that is in the graph', function(done) {
			let g = new Graph();

			let nodeData = {dataKey: 'dataVal'};
			let nodeKey = 'key';
			g.addNode(nodeKey, nodeData);
			if(g.hasNode(nodeKey))
				done();
			else
				throw new Error('Node not found in graph');
		});
	});

	describe('Has Node - Does not exist', function() {
		it('should try to find a node that is in the graph', function(done) {
			let g = new Graph();

			let nodeData = {dataKey: 'dataVal'};
			let nodeKey = 'key';
			g.addNode(nodeKey, nodeData);
			if(g.hasNode(nodeKey + 'extra'))
				throw new Error('Has node returned true, when should have returned false');
			else
				done();
		});
	});

	describe('Add Edge - Normal', function() {
		it('should insert two nodes (A and B), and an edge from A to B', function(done) {
			let g = new Graph();


			g.addNode('a', 'Node A');
			g.addNode('b', 'Node B');

			g.addEdge('a', 'b');
			done();

			// TODO add getEdge function
		});
	});

	describe('Add Edge - Cycle', function() {
		it('should insert three nodes (A, B and C), with edges including a cycle', function(done) {
			let g = new Graph();


			g.addNode('a', 'Node A');
			g.addNode('b', 'Node B');
			g.addNode('c', 'Node B');

			g.addEdge('a', 'b');
			g.addEdge('b', 'c');
			g.addEdge('a', 'c');

			try {
				g.addEdge('c', 'a'); // Adds a cycle
				throw new Error('Failed to detect cycle');
			}
			catch(error) {
				if(error.message === 'graph_cycle')
					done();
				else
					throw new Error('Unknown error message' + error.message);
			}
		});
	});

	describe('Depth-First Traverse - All', function() {
		it('should create a graph with 3 nodes and edges, and attempt to traverse it, ', function(done) {
			let g = new Graph();


			g.addNode('a', 'Node A');
			g.addNode('b', 'Node B');
			g.addNode('c', 'Node B');

			g.addEdge('a', 'b'); // A depends on B (B comes before A)
			g.addEdge('b', 'c'); // B depends on C (C comes before B)
			g.addEdge('a', 'c'); // A depends on C (C comes before A)

			let nodeOrder = ['c', 'b', 'a'];

			g.depthFirstTraverse(function(nodeData, nodeKey) {
				if(nodeKey === nodeOrder[0]) {
					nodeOrder.shift();
					if(nodeOrder.length === 0)
						done();
				}
				else
					throw new Error('Wrong order');
			});
		});
	});

	describe('Depth-First Traverse - Disjoint', function() {
		it('should create a graph with 4 nodes, including a disjoined node, and attempt to traverse it, ', function(done) {
			let g = new Graph();

			g.addNode('a', 'Node A');
			g.addNode('b', 'Node B');
			g.addNode('c', 'Node B');
			g.addNode('d', 'Node D');

			g.addEdge('a', 'b'); // A depends on B (B comes before A)
			g.addEdge('b', 'c'); // B depends on C (C comes before B)
			g.addEdge('a', 'c'); // A depends on C (C comes before A)

			let nodeOrder = ['c', 'b', 'a', 'd'];

			g.depthFirstTraverse(function(nodeData, nodeKey) {
				if(nodeKey === nodeOrder[0]) {
					nodeOrder.shift();
					if(nodeOrder.length === 0)
						done();
				}
				else
					throw new Error('Wrong order');
			});
		});
	});

	describe('Depth-First Traverse - With starting point', function() {
		it('should create a graph with 4 nodes, including a disjoined node, and attempt to traverse it from a given starting point, ', function(done) {
			let g = new Graph();

			g.addNode('a', 'Node A');
			g.addNode('b', 'Node B');
			g.addNode('c', 'Node B');
			g.addNode('d', 'Node D');

			g.addEdge('a', 'b'); // A depends on B (B comes before A)
			g.addEdge('b', 'c'); // B depends on C (C comes before B)
			g.addEdge('a', 'c'); // A depends on C (C comes before A)

			let nodeOrder = ['c', 'b'];

			g.depthFirstTraverse(function(nodeData, nodeKey) {
				if(nodeKey == nodeOrder[0]) {
					nodeOrder.shift();
					if(nodeOrder.length == 0)
						done();
				}
				else
					throw new Error('Wrong order');
			}, 'b');
		});
	});

});
