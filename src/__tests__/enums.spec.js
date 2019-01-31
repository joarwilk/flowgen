import { compiler, beautify } from "..";

it("should handle basic enums", () => {
  const ts = `enum Label {
    LABEL_OPTIONAL,
    LABEL_REQUIRED,
    LABEL_REPEATED,
  }`;
  const result = compiler.compileDefinitionString(ts);
  expect(beautify(result)).toMatchSnapshot();
});

it("should handle number enums", () => {
  const ts = `enum Label {
    LABEL_OPTIONAL = 1,
    LABEL_REQUIRED = 2,
    LABEL_REPEATED = 3,
  }`;
  const result = compiler.compileDefinitionString(ts);
  expect(beautify(result)).toMatchSnapshot();
});

it("should handle string enums", () => {
  const ts = `enum Label {
    LABEL_OPTIONAL = 'LABEL_OPTIONAL',
    LABEL_REQUIRED = 'LABEL_REQUIRED',
    LABEL_REPEATED = 'LABEL_REPEATED',
  }`;
  const result = compiler.compileDefinitionString(ts);
  expect(beautify(result)).toMatchSnapshot();
});
