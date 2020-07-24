import type { RawNode } from "./node";
import Node from "./node";

import * as printers from "../printers";

export default class Export extends Node {
  constructor(node: RawNode) {
    super(node);
  }

  print() {
    return printers.relationships.moduleExports(this.raw);
  }
}
