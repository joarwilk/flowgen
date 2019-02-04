// @flow

import { SyntaxKind } from "typescript";

export default function getNodeName(node: any): string {
  return SyntaxKind[node.kind] || node.constructor + "";
}
