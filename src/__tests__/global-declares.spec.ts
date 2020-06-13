import { compiler, beautify } from "..";

it("should handle declared interfaces", () => {
  const ts = `
declare interface ICustomMessage {
  method(test: string): void;
  otherMethod(literal: "A"|"B"): void;
}
`;
  expect(
    beautify(compiler.compileDefinitionString(ts, { quiet: true })),
  ).toMatchSnapshot();
});
