// @flow

import { compiler, beautify } from "..";

it("should handle namespaces", () => {
  const ts = `
namespace test {
  export const ok: number
}
`;
  const result = compiler.compileDefinitionString(ts);
  expect(beautify(result)).toMatchSnapshot();
});

it("should handle namespace merging", () => {
  const ts = `
namespace test {
  export const ok: number
}
namespace test {
  export const error: string
}
`;
  const result = compiler.compileDefinitionString(ts);
  expect(beautify(result)).toMatchSnapshot();
});

it("should handle namespace function merging", () => {
  const ts = `
namespace test {
  declare function test(err: number): void
}
namespace test {
  declare function test(response: string): string
}
`;
  const result = compiler.compileDefinitionString(ts);
  expect(beautify(result)).toMatchSnapshot();
});
