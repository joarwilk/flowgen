/* @flow */

export const moduleExports = (node: RawNode) => {
  if (node.isDefault) {
    return `declare module.exports: ${node.name}`
  }

  // I dont think this case will ever happen right now
  console.error('Encountered a non-default export to print');
  return '';
}

export const exporter = (node: RawNode) => {
  let str = '';

  if (node.modifiers && node.modifiers.some(modifier => modifier.kind === 'ExportKeyword')) {
    str += 'export '
  }

  if (node.modifiers && node.modifiers.some(modifier => modifier.kind === 'DefaultKeyword')) {
    str += 'default '
  }

  return str;
}

export const imports = (node: ImportNode, moduleName: string): string => {
  let str = 'import type ';

  if (node.default) {
    str += node.default;

    if (node.explicit.length) {
      str += ', ';
    }
  }

  if (node.explicit.length) {
    str += `{ ${node.explicit.join(', ')} }`;
  }

  str += ` from '${moduleName}'`;

  return str;
}
