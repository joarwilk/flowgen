import { compiler, beautify } from "..";
import "../test-matchers";

it("should handle dynamic imports", () => {
  const ts = `
type A = import('react');
type B = import('react').ReactNode;
`;
  const result = compiler.compileDefinitionString(ts, { quiet: true });
  expect(beautify(result)).toMatchSnapshot();
  expect(result).toBeValidFlowTypeDeclarations();
});
