import type Node from "../nodes/node";

/**
 * A way to represent multiple nodes with the same name
 * in the same scope.
 *
 * TypeScript supports declaring the same function/type/interface multiple times,
 * which flow does not. This is a representation of that data.
 */
export default class UnionNode {
  _nodes: Array<Node>;

  constructor(nodes: Node | Node[]) {
    this._nodes = [];

    this.add(nodes);
  }

  add(nodes: Node | Node[]) {
    if (Array.isArray(nodes)) {
      nodes.forEach(node => {
        this._nodes.push(node);
      });
    } else {
      this._nodes.push(nodes);
    }
  }

  get() {
    return this._nodes;
  }
}
