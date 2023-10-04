import { compiler, beautify } from "..";
import "../test-matchers";

it("should use spread when performing union of exact object types", () => {
  const ts = `
type Foo = { foo: number };
type Bar = { bar: string };
const combination: Foo & Bar;
`;
  const result = compiler.compileDefinitionString(ts, {
    quiet: true,
    inexact: false,
  });
  expect(beautify(result)).toMatchSnapshot();
  expect(result).toBeValidFlowTypeDeclarations();
});

it("should not use spread when performing union of inexact object types", () => {
  const ts = `
type Foo = { foo: number };
type Bar = { bar: string };
const combination: Foo & Bar;
`;
  const result = compiler.compileDefinitionString(ts, {
    quiet: true,
    inexact: true,
  });
  expect(beautify(result)).toMatchSnapshot();
  expect(result).toBeValidFlowTypeDeclarations();
});

it("should not insert spread when performing union of class types", () => {
  const ts = `
class Foo {}
class Bar {}
const combination: Foo & Bar;
`;
  const result = compiler.compileDefinitionString(ts, { quiet: true });
  expect(beautify(result)).toMatchSnapshot();
  expect(result).toBeValidFlowTypeDeclarations();
});
