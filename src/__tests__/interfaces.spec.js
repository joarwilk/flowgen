import { compiler, beautify } from "..";

it("should handle single interface", () => {
  const ts = `
interface User {
  firstName: string
}
`;
  const result = compiler.compileDefinitionString(ts);
  expect(beautify(result)).toMatchSnapshot();
  const result2 = compiler.compileDefinitionString(ts, {
    interfaceRecords: true,
  });
  expect(beautify(result2)).toMatchSnapshot();
});

it("should handle interface inheritance", () => {
  const ts = `
interface User {
  firstName: string
}
interface SpecialUser extends User {
  nice: number
}
`;
  const result = compiler.compileDefinitionString(ts);
  expect(beautify(result)).toMatchSnapshot();
  const result2 = compiler.compileDefinitionString(ts, {
    interfaceRecords: true,
  });
  expect(beautify(result2)).toMatchSnapshot();
});

it("should handle interface merging", () => {
  const ts = `
interface User {
  firstName: string
}
interface User {
  lastName: string
}
interface User {
  username: string
}
`;
  const result = compiler.compileDefinitionString(ts);
  expect(beautify(result)).toMatchSnapshot();
  const result2 = compiler.compileDefinitionString(ts, {
    interfaceRecords: true,
  });
  expect(beautify(result2)).toMatchSnapshot();
});
