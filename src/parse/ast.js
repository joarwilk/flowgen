// @flow

import * as ts from "typescript";
import type { RawNode } from "../nodes/node";
import _ from "lodash";
import getNodeName from "../nodename";

import printers from "../printers";

export const parseNameFromNode = (node: RawNode): string => {
  if (node.name && node.name.text) {
    return node.name.text;
  } else if (node.type && node.type.typeName) {
    return node.type.typeName.text;
  } else if (node.moduleSpecifier) {
    return node.moduleSpecifier.text;
  } else if (node.expression) {
    return printers.node.printType(stripDetailsFromTree(node.expression));
  } else if (node.declarationList) {
    const declarations = node.declarationList.declarations
      .map(stripDetailsFromTree)
      .map(printers.node.printType)
      .join(" ");

    return declarations;
  } else if (node.exportClause) {
    let names = [];
    ts.forEachChild(node.exportClause, child => {
      names.push(parseNameFromNode(child));
    });
    return names.join(",");
  }

  console.log("INVALID NAME", ts.SyntaxKind[node.kind]);
  return "INVALID NAME REF";
};

// Traverse a node and strip information we dont care about
// This is mostly to make debugging a bit less verbose
export const stripDetailsFromTree = (root: RawNode): any => {
  const clone = _.omit(root, ["pos", "end", "parent", "flags"]);

  for (const key in clone) {
    const val = clone[key];

    if (clone.hasOwnProperty(key) && typeof val === "object") {
      if (_.isArray(val)) {
        clone[key] = val.map(item => stripDetailsFromTree(item));
      } else {
        clone[key] = stripDetailsFromTree(val);
      }
    }
  }

  // Use actual names instead of node type IDs
  clone.kind = getNodeName(clone);

  return clone;
};

export function getMembersFromNode(node: any): void {
  if (node.members) {
    return node.members;
  }

  if (node.type && node.type.members) {
    return node.type.members;
  }

  console.log("NO MEMBERS_", ts.SyntaxKind[node.kind], node);
}
