import { SyntaxKind } from "typescript";

import type { Node } from "typescript";

export default function getNodeName(node: Node): string {
  return SyntaxKind[node.kind] || node.constructor + "";
}
