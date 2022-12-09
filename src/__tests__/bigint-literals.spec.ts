import { compiler, beautify } from "..";
import "../test-matchers";

it("should handle bigint literals in type", () => {
  const ts = `
  type MyBigType = bigint;
  type bigint_like = number | bigint | string;
  
  // these are not supported by flowgen yet
  // but we should test them once they are supported
  // const literal = 9007199254740991n;
  // const ctor = BigInt("9007199254740991"); // 9007199254740991n
`;

  const result = compiler.compileDefinitionString(ts, { quiet: true });

  expect(beautify(result)).toMatchSnapshot();
  expect(result).toBeValidFlowTypeDeclarations();
});
