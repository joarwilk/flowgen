import { compiler, beautify } from "..";
import "../test-matchers";

it("should handle bigint literals in type", () => {
  const ts = `
    type MyBigType = bigint;
    type bigint_like = number | bigint | string;
    const literal = 9007199254740991n;
  `;

  // unsupported expressions that should be supported
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt
  // const ts = `
  //   const ctor = BigInt("9007199254740991");
  //   const add = 4n + 5n;
  //   const mult = 4n * 5n;
  //   const sub = 4n - 5n;
  //   const mod = 4n % 3n;
  //   const exp = 4n ** 2n;
  //   const div = 4n / 2n;
  //   const eq = 4n == 0;
  //   const cmp = 4n > 0;
  //   const mixed = [4n, 6, -12n, 10, 4, 0, 0n];
  //   const boolCast = !12n;
  // `;

  const result = compiler.compileDefinitionString(ts, { quiet: true });

  expect(beautify(result)).toMatchSnapshot();
  expect(result).toBeValidFlowTypeDeclarations();
});
