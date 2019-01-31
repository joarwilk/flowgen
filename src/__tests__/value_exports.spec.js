import { compiler, beautify } from "..";

it("should handle exported es module values", () => {
  const ts = `declare var test: {a: number};
export {test};
`;
  const result = compiler.compileDefinitionString(ts);
  expect(beautify(result)).toMatchSnapshot();
});

it("should handle default exported es module values", () => {
  const ts = `declare var test: {a: number};
export default test;
`;
  const result = compiler.compileDefinitionString(ts);
  expect(beautify(result)).toMatchSnapshot();
});
