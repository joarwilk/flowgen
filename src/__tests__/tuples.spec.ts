import { compiler, beautify } from "..";
import "../test-matchers";

it("should handle tuples", () => {
  const ts = `
  type T1 = [number, string?];
  type T2 = [number, ...string[]];
  `;
  const result = compiler.compileDefinitionString(ts, { quiet: true });
  expect(beautify(result)).toMatchSnapshot();
  expect(result).toBeValidFlowTypeDeclarations();
});
