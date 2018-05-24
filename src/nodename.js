import { SyntaxKind } from "typescript";

export default function getNodeName(node) {
  return SyntaxKind[node.kind] || node.constructor + "";
}
