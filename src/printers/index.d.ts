import type { RawNode } from "../nodes/node";
import * as ts from "typescript";

let __default: {
  basics: {
    print(kind: string): string;
  };
  identifiers: {
    print(kind: string): string;
  };
  declarations: {
    propertyDeclaration(node: RawNode, keywordPrefix: string): string;
    variableDeclaration(node: RawNode): string;
    interfaceType(
      node: RawNode,
      withSemicolons?: boolean,
      isType?: boolean,
    ): string;
    interfaceDeclaration(
      nodeName: string,
      node: RawNode,
      modifier: string,
    ): string;
    typeDeclaration(nodeName: string, node: RawNode, modifier: string): string;
    enumDeclaration(nodeName: string, node: RawNode): string;
    typeReference(node: RawNode): string;
    classDeclaration(nodeName: string, node: RawNode): string;
  };
  common: {
    parameter(param: RawNode): string;
    parseTypeReference(node: RawNode): string;
    methodSignature(param: RawNode): string;
    generics(
      types: ts.NodeArray<RawNode> | undefined | null,
      map?: (node: RawNode) => RawNode,
    ): string;
    literalType(node: RawNode): string;
    typeParameter(node: RawNode): string;
    comment(jsdoc: ReadonlyArray<ts.JSDoc>): string;
  };
  functions: {
    functionType(func: RawNode, dotAsReturn?: boolean): string;
    functionDeclaration(nodeName: string, node: RawNode): string;
  };
  relationships: {
    moduleExports(node: RawNode): string;
    exporter(node: RawNode): string;
    namespace(name: string, hidePunctuation?: boolean): string;
    namespaceProp(name: string, hidePunctuation?: boolean): string;
    importExportSpecifier(node: RawNode): string;
  };
  node: {
    printType(type: RawNode): string;
  };
};

export default __default;
