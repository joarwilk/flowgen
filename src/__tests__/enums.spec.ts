import { compiler, beautify } from "..";
import "../test-matchers";

it("should handle empty enums", () => {
  const ts = `enum Empty { }`;
  const result = compiler.compileDefinitionString(ts, { quiet: true });
  expect(beautify(result)).toMatchSnapshot("class");
  expect(result).toBeValidFlowTypeDeclarations();
});

it("should handle basic enums", () => {
  const ts = `enum Label {
    LABEL_OPTIONAL,
    LABEL_REQUIRED,
    LABEL_REPEATED,
  }
type A = Label
type B = Label.LABEL_OPTIONAL
`;
  const result = compiler.compileDefinitionString(ts, { quiet: true });
  expect(beautify(result)).toMatchSnapshot("class");
  expect(result).toBeValidFlowTypeDeclarations();
});

it("should handle number enums", () => {
  const ts = `enum Label {
    ONE = 1,
    TWO = 2,
    THREE = 3,
    NEGATIVE = -123,
    DECIMAL = 3.14,
  }
type A = Label
type B = Label.TWO
`;
  const result = compiler.compileDefinitionString(ts, { quiet: true });
  expect(beautify(result)).toMatchSnapshot("class");
  expect(result).toBeValidFlowTypeDeclarations();
});

it("should handle string enums", () => {
  const ts = `enum Label {
    LABEL_OPTIONAL = 'LABEL_OPTIONAL',
    LABEL_REQUIRED = 'LABEL_REQUIRED',
    LABEL_REPEATED = 'LABEL_REPEATED',
  }
type A = Label
type B = Label.LABEL_REQUIRED
`;
  const result = compiler.compileDefinitionString(ts, { quiet: true });
  expect(beautify(result)).toMatchSnapshot("class");
  expect(result).toBeValidFlowTypeDeclarations();
});

it("should handle importing enum types", () => {
  const results = compiler.compileDefinitionFiles(
    [
      "src/__tests__/snippet/export-enum-file.ts",
      "src/__tests__/snippet/import-enum-type-file.ts",
    ],
    {
      quiet: false,
    },
  );
  for (const result of results) {
    expect(beautify(result[1])).toMatchSnapshot("class");
    // TODO: this function only runs flow on one file at a time, so it errors when trying to import
    // expect(result[1]).toBeValidFlowTypeDeclarations();
  }
});

it("should handle importing enums", () => {
  const results = compiler.compileDefinitionFiles(
    [
      "src/__tests__/snippet/export-enum-file.ts",
      "src/__tests__/snippet/import-enum-file.ts",
    ],
    {
      quiet: false,
    },
  );
  for (const result of results) {
    expect(beautify(result[1])).toMatchSnapshot("class");
    // TODO: this function only runs flow on one file at a time, so it errors when trying to import
    // expect(result[1]).toBeValidFlowTypeDeclarations();
  }
});
