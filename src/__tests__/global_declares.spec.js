// @flow
import compiler from "../cli/compiler";
import beautify from "../cli/beautifier";

it("should handle declared interfaces", () => {
  const ts = `
declare interface ICustomMessage {
  method(test: string): void;
  otherMethod(literal: "A"|"B"): void;
}
`;
  expect(beautify(compiler.compileDefinitionString(ts))).toMatchSnapshot();
});


