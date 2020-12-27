import { compiler, beautify } from "..";
import "../test-matchers";

it("should handle computed Symbol.iterator and Symbol.asyncIterator", () => {
  const ts = `
  type A = {
    [Symbol.asyncIterator]?(): any,
    [Symbol.iterator]?(): any,
    readonly [Symbol.asyncIterator]?(): any,
    readonly [Symbol.iterator]?(): any,
    [Symbol.asyncIterator](): any,
    [Symbol.iterator](): any,
    readonly [Symbol.asyncIterator](): any,
    readonly [Symbol.iterator](): any,
    [Symbol.asyncIterator]?: any,
    [Symbol.iterator]?: any,
    readonly [Symbol.asyncIterator]?: any,
    readonly [Symbol.iterator]?: any,
    [Symbol.asyncIterator]: any,
    [Symbol.iterator]: any,
    readonly [Symbol.asyncIterator]: any,
    readonly [Symbol.iterator]: any,
  }
  declare class B {
    [Symbol.asyncIterator]?(): any,
    [Symbol.iterator]?(): any,
    readonly [Symbol.asyncIterator]?(): any,
    readonly [Symbol.iterator]?(): any,
    [Symbol.asyncIterator](): any,
    [Symbol.iterator](): any,
    readonly [Symbol.asyncIterator](): any,
    readonly [Symbol.iterator](): any,
    [Symbol.asyncIterator]?: any,
    [Symbol.iterator]?: any,
    readonly [Symbol.asyncIterator]?: any,
    readonly [Symbol.iterator]?: any,
    [Symbol.asyncIterator]: any,
    [Symbol.iterator]: any,
    readonly [Symbol.asyncIterator]: any,
    readonly [Symbol.iterator]: any,
  }
  interface C {
    [Symbol.asyncIterator]?(): any,
    [Symbol.iterator]?(): any,
    readonly [Symbol.asyncIterator]?(): any,
    readonly [Symbol.iterator]?(): any,
    [Symbol.asyncIterator](): any,
    [Symbol.iterator](): any,
    readonly [Symbol.asyncIterator](): any,
    readonly [Symbol.iterator](): any,
    [Symbol.asyncIterator]?: any,
    [Symbol.iterator]?: any,
    readonly [Symbol.asyncIterator]?: any,
    readonly [Symbol.iterator]?: any,
    [Symbol.asyncIterator]: any,
    [Symbol.iterator]: any,
    readonly [Symbol.asyncIterator]: any,
    readonly [Symbol.iterator]: any,
  }
`;

  const result = compiler.compileDefinitionString(ts, { quiet: true });

  expect(beautify(result)).toMatchSnapshot();
  expect(result).toBeValidFlowTypeDeclarations();
});

it("should handle string literals", () => {
  const ts = `
  type A = {
    ["foo"]?(): any,
    readonly ["foo"]?(): any,
    ["foo"](): any,
    readonly ["foo"](): any,
    ["foo"]?: any,
    readonly ["foo"]?: any,
    ["foo"]: any,
    readonly ["foo"]: any,
  }
  declare class B {
    ["foo"]?(): any,
    readonly ["foo"]?(): any,
    ["foo"](): any,
    readonly ["foo"](): any,
    ["foo"]?: any,
    readonly ["foo"]?: any,
    ["foo"]: any,
    readonly ["foo"]: any,
  }
  interface C {
    ["foo"]?(): any,
    readonly ["foo"]?(): any,
    ["foo"](): any,
    readonly ["foo"](): any,
    ["foo"]?: any,
    readonly ["foo"]?: any,
    ["foo"]: any,
    readonly ["foo"]: any,
  }
`;

  const result = compiler.compileDefinitionString(ts, { quiet: true });

  expect(beautify(result)).toMatchSnapshot();
  expect(result).toBeValidFlowTypeDeclarations();
});

it("should approximate unsupported keys", () => {
  const ts = `
  type A = {
    [Foo]?(): any,
    readonly [Foo]?(): any,
    [Foo](): any,
    readonly [Foo](): any,
    [Foo]?: any,
    readonly [Foo]?: any,
    [Foo]: any,
    readonly [Foo]: any,
  }
  declare class B {
    [Foo]?(): any,
    readonly [Foo]?(): any,
    [Foo](): any,
    readonly [Foo](): any,
    [Foo]?: any,
    readonly [Foo]?: any,
    [Foo]: any,
    readonly [Foo]: any,
  }
  interface C {
    [Foo]?(): any,
    readonly [Foo]?(): any,
    [Foo](): any,
    readonly [Foo](): any,
    [Foo]?: any,
    readonly [Foo]?: any,
    [Foo]: any,
    readonly [Foo]: any,
  }
`;

  const result = compiler.compileDefinitionString(ts, { quiet: true });

  expect(beautify(result)).toMatchSnapshot();
  expect(result).not.toBeValidFlowTypeDeclarations(); // unsupported-syntax
});
