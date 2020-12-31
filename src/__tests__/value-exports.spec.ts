import { compiler, beautify } from "..";
import "../test-matchers";

it("should handle exported es module values", () => {
  const ts = `declare var test: {a: number};
export {test};
`;
  const result = compiler.compileDefinitionString(ts, { quiet: true });
  expect(beautify(result)).toMatchSnapshot();
  expect(result).toBeValidFlowTypeDeclarations();
});

it("should handle default exported es module values", () => {
  const ts = `declare var test: {a: number};
export default test;
`;
  const result = compiler.compileDefinitionString(ts, { quiet: true });
  expect(beautify(result)).toMatchSnapshot();
  expect(result).toBeValidFlowTypeDeclarations();
});
