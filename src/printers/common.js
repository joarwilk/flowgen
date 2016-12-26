/* @flow */
import type { RawNode } from './nodes/node';

import nodePrinter from './node';

export const parameter = (param: RawNode) => {
  let left = param.name.text;
  let right;

  if (param.name.kind === "ObjectBindingPattern") {
    left = `{${param.name.elements.map(nodePrinter).join(', ')}}`
  }

  if (!param.type) {
    right = "<<UNKNOWN PARAM FORMAT>>";
  } else {
    right = nodePrinter(param.type);
  }

  if (param.questionToken) {
    left += '?';
  }

  if (param.dotDotDotToken) {
    left = '...' + left;
  }

  return `${left}: ${right}`;
}



export const parseTypeReference = (node) => {
  if (node.typeName.left && node.typeName.right) {
    return printType(node.typeName) + printGenerics(node.typeArguments);
  }

  return node.typeName.text + printGenerics(node.typeArguments)
}

export const printGenerics = (types) => (
  (types && types.length) ? `<${types.map(printType).join(', ')}>` : ''
)
