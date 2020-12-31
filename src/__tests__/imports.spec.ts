import { compiler, beautify } from "..";
import "../test-matchers";

it("should handle imports", () => {
  const ts = `import { GeneratorOptions } from "@babel/generator";
import traverse, { Visitor, NodePath } from "@babel/traverse";
import { Visitor as NewVisitor } from "@babel/traverse";
import template from "@babel/template";
import * as t from "@babel/types";
import v, * as d from 'typescript';`;
  const result = compiler.compileDefinitionString(ts, { quiet: true });
  expect(beautify(result)).toMatchSnapshot();
  expect(result).not.toBeValidFlowTypeDeclarations(); // cannot-resolve-module
});

it("should handle imports inside module", () => {
  const ts = `
declare module '@babel/core' {
  import { GeneratorOptions } from "@babel/generator";
  import traverse, { Visitor, NodePath } from "@babel/traverse";
  import { Visitor as NewVisitor } from "@babel/traverse";
  import template from "@babel/template";
  import * as t from "@babel/types";
  import v, * as d from 'typescript';
}
`;
  const result = compiler.compileDefinitionString(ts, { quiet: true });
  expect(beautify(result)).toMatchSnapshot();
  expect(result).not.toBeValidFlowTypeDeclarations(); // cannot-resolve-module
});

it("should handle import type", () => {
  const ts = `
type S = typeof import('http')
`;
  const result = compiler.compileDefinitionString(ts, { quiet: true });
  expect(beautify(result)).toMatchSnapshot();
  expect(result).toBeValidFlowTypeDeclarations();
});

it("should handle type imports", () => {
  const ts = `import type { GeneratorOptions } from "@babel/generator";
import type traverse from "@babel/traverse";
import type { Visitor as NewVisitor } from "@babel/traverse";
`;
  const result = compiler.compileDefinitionString(ts, { quiet: true });
  expect(beautify(result)).toMatchSnapshot();
  expect(result).not.toBeValidFlowTypeDeclarations(); // cannot-resolve-module
});
