import compiler from "../compiler";
import beautify from "../beautifier";
import "../../test-matchers";

it("should handle maybe & nullable type", () => {
  const result = compiler.compileDefinitionString(
    "let a: string | null | undefined",
    { quiet: true },
  );

  expect(result).toMatchSnapshot();
  expect(result).toBeValidFlowTypeDeclarations();
});

it("should handle bounded polymorphism", () => {
  const ts = `
    function fooGood<T extends { x: number }>(obj: T): T {
      console.log(Math.abs(obj.x));
      return obj;
    }
  `;

  const result = compiler.compileDefinitionString(ts, { quiet: true });

  expect(beautify(result)).toMatchSnapshot();
  expect(result).toBeValidFlowTypeDeclarations();
});
