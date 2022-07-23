import { compiler, beautify } from "..";
import "../test-matchers";

it("should handle indexers", () => {
  const ts = `
type Map = {
  [key: string]: number
}
`;
  {
    const result = compiler.compileDefinitionString(ts, { quiet: true });
    expect(beautify(result)).toMatchSnapshot();
    expect(result).toBeValidFlowTypeDeclarations();
  }

  {
    const result = compiler.compileDefinitionString(ts, {
      quiet: true,
      inexact: false,
    });
    expect(beautify(result)).toMatchSnapshot();
    expect(result).toBeValidFlowTypeDeclarations();
  }
});
