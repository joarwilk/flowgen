import { compiler, beautify } from "..";
import "../test-matchers";

it("should handle exported interfaces", () => {
  const ts = `export function add<T extends string | number>(a: T, b: T): T extends string ? string : number;`;
  const result = compiler.compileDefinitionString(ts, { quiet: true });
  expect(beautify(result)).toMatchSnapshot();
  expect(result).toBeValidFlowTypeDeclarations();
});
