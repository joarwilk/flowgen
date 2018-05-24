/* @flow */
import compiler from "../compiler";
import fs from "fs";

it("handles the danger.d.ts correctly", () => {
  const dangerDTS = fs.readFileSync(
    `${__dirname}/fixtures/danger.d.ts`,
    "utf8",
  );
  const result = compiler.compileDefinitionString(dangerDTS);

  expect(result).toMatchSnapshot();
});
