/* @flow */
import type { RawNode } from './nodes/node';

import _ from 'lodash';
import ts from 'typescript';

import Node from './nodes/node';
import ImportNode from './nodes/import';
import ExportNode from './nodes/export';
import ModuleNode from './nodes/module';
import VariableNode from './nodes/variable';
import PropertyNode from './nodes/property';
import NamespaceNode from './nodes/namespace';
import namespaceManager from './namespaceManager';
import printers from './printers';
import getNodeName from './nodename';

export const parseNameFromNode = (node: RawNode) => {
  if (node.name && node.name.text) {
    return node.name.text;
  }

  else if (node.type && node.type.typeName) {
    return node.type.typeName.text;
  }

  else if (node.moduleSpecifier) {
    return node.moduleSpecifier.text;
  }

  console.log('INVALID NAME');
  return 'INVALID NAME REF';
}

// Traverse a node and strip information we dont care about
// This is mostly to make debugging a bit less verbose
export const stripDetailsFromTree = (root: RawNode) => {
  const clone = _.omit(root, ['pos', 'end', 'parent', 'flags'])

  for (const key in clone) {
    const val = clone[key];

    if (clone.hasOwnProperty(key) && typeof val === 'object') {
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
}

// Walk the AST and extract all the definitions we care about
const traverseNode = (ast, context: Node) => {
  ast.statements.forEach(node => {
    switch (node.kind) {

      case ts.SyntaxKind.ModuleDeclaration:
        if (node.flags === 4098 || node.flags === 16 /* TODO: Replace with namespace flag enum */) {
          const namespace = new NamespaceNode(node.name.text);

          context.addChild(namespace);

          namespaceManager.setContext(node.name.text);

          traverseNode(node.body, namespace); break;
        } else {
          const module = new ModuleNode(node.name.text);

          context.addChild(module);

          traverseNode(node.body, module); break;
        }

      case ts.SyntaxKind.FunctionDeclaration:
        context.addChild(new PropertyNode(node)); break;

      case ts.SyntaxKind.InterfaceDeclaration:
        context.addChild(new PropertyNode(node)); break;

      case ts.SyntaxKind.TypeAliasDeclaration:
        context.addChild(new PropertyNode(node)); break;

      case ts.SyntaxKind.ClassDeclaration:
        context.addChild(new PropertyNode(node)); break;

      case ts.SyntaxKind.VariableStatement:
        context.addChild(new VariableNode(node)); break;

      case ts.SyntaxKind.ExportAssignment:
        context.addChild(new ExportNode(node)); break;

      case ts.SyntaxKind.ImportDeclaration:
        context.addChild(new ImportNode(node)); break;

      default:
        console.log('Missing node parse', node.kind);
    }
  })
}

export function recursiveWalkTree(ast: any) {
  const root = new ModuleNode('root');

  traverseNode(ast, root);

  return root;
}
