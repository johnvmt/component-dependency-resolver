import ExtendedError from "./ExtendedError.js";

class GraphNode {
    constructor(value) {
        this._outgoingEdges = new Set();
        this._incomingEdges = new Set();
    }

    get edges() {
        return new Set(this._outgoingEdges);
    }

    get indegree() {
        return this._incomingEdges.size;
    }

    get outdegree() {
        return this._outgoingEdges.size;
    }

    hasEdge(sinkNode) {
        return this.hasOutgoingEdge(sinkNode);
    }

    hasOutgoingEdge(sinkNode) {
        return this._outgoingEdges.has(sinkNode);
    }

    addOutgoingEdge(sinkNode) {
        if(this.hasEdge(sinkNode))
            throw new ExtendedError('Edge already exists', {code: 'edge_exists'});

        this._outgoingEdges.add(sinkNode);
        sinkNode._addIncomingEdge(this);
    }

    addEdge(sinkNode) {
        return this.addOutgoingEdge(sinkNode);
    }

    removeOutgoingEdge(sinkNode) {
        if(!this.hasOutgoingEdge(sinkNode))
            throw new ExtendedError('Edge does not exist', {code: 'edge_undefined'});

        this._outgoingEdges.delete(sinkNode);
        sinkNode._removeIncomingEdge(this);
    }

    removeEdge(sinkNode) {
        return this.removeOutgoingEdge(sinkNode);
    }

    /**
     * Add a reference to an incoming edge to this node only
     * @param sourceNode
     * @private
     */
    _addIncomingEdge(sourceNode) {
        this._incomingEdges.add(sourceNode);
    }

    /**
     * Remove a reference to an incoming edge from this node only
     * @param sourceNode
     * @private
     */
    _removeIncomingEdge(sourceNode) {
        this._incomingEdges.delete(sourceNode);
    }

    /**
     * Remove all outgoing edges and incoming edges
     */
    removeAllEdges() {
        this.removeAllOutgoingEdges();
        this.removeAllIncomingEdges();
    }

    /**
     * Remove all outgoing edges
     */
    removeAllOutgoingEdges() {
        for(let sinkNode of this._outgoingEdges) {
            sinkNode._removeIncomingEdge(this);
        }

        this._outgoingEdges.clear();
    }

    /**
     * Disconnect all nodes with edges to this one
     */
    removeAllIncomingEdges() {
        for(let sourceNode of this._incomingEdges) {
            sourceNode.removeOutgoingEdge(this);
        }
        // source nodes will remove the incoming edge from this node
    }

    /**
     * Disconnect from graph by removing all edges
     */
    disconnect() {
        return this.removeAllEdges();
    }
}

export default GraphNode;
