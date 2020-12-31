import compiler from "../compiler";
import beautify from "../beautifier";
import "../../test-matchers";
import fs from "fs";

it("handles the danger.d.ts correctly", () => {
  const dangerDTS = fs.readFileSync(
    `${__dirname}/fixtures/danger.d.ts`,
    "utf8",
  );
  const result = compiler.compileDefinitionString(dangerDTS, { quiet: true });

  expect(beautify(result)).toMatchSnapshot();
  expect(result).not.toBeValidFlowTypeDeclarations(); // cannot-resolve-module
});
