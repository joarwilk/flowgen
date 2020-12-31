import { compiler, beautify } from "..";
import "../test-matchers";

it("should handle boolean literals in type", () => {
  const ts = `
  type MyFalsyType = string | false;
  type MyTruthyType = true | string;
`;

  const result = compiler.compileDefinitionString(ts, { quiet: true });

  expect(beautify(result)).toMatchSnapshot();
  expect(result).toBeValidFlowTypeDeclarations();
});
