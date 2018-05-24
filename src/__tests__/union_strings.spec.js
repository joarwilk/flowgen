import compiler from "../cli/compiler";
import beautify from "../cli/beautifier";

it("should handle union strings", () => {
  const ts = `
  interface MyObj {
    state?: "APPROVED" | "REQUEST_CHANGES" | "COMMENT" | "PENDING"
  }
`;

  const result = compiler.compileDefinitionString(ts);

  expect(beautify(result)).toMatchSnapshot();
});
