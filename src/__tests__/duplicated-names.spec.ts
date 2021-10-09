import { compiler, beautify } from "..";
import "../test-matchers";

it("should handle variable & type having same name", () => {
  const ts = `
  export declare const AuthMechanism: {
    readonly MONGODB_AWS: "MONGODB-AWS";
    readonly MONGODB_CR: "MONGODB-CR";
  };
  export declare type AuthMechanism = typeof AuthMechanism[keyof typeof AuthMechanism];
`;
  const result = compiler.compileDefinitionString(ts, { quiet: true });
  expect(beautify(result)).toMatchSnapshot();
  expect(result).toBeValidFlowTypeDeclarations();
});

it("should generate unique names", () => {
  const ts = `
  export declare type AuthMechanismType = string;
  export declare const AuthMechanism: {
    readonly MONGODB_AWS: "MONGODB-AWS";
    readonly MONGODB_CR: "MONGODB-CR";
  };
  export declare type AuthMechanism = typeof AuthMechanism[keyof typeof AuthMechanism];
`;
  const result = compiler.compileDefinitionString(ts, { quiet: true });
  expect(beautify(result)).toMatchSnapshot();
  expect(result).toBeValidFlowTypeDeclarations();
});

it("should be scoped to main file", () => {
  const ts = `
  import { Buffer } from 'buffer';
  export declare type BufferAlias = Buffer;
`;
  const result = compiler.compileDefinitionString(ts, { quiet: true });
  expect(beautify(result)).toMatchSnapshot();
  // FlowJs is not valid due to `import` not transpiled to typeof
  // expect(result).toBeValidFlowTypeDeclarations();
});
