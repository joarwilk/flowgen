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

it("should handle exported interfaces and types", () => {
  const ts = `
namespace Example {
  export interface StoreModel<S> {}
}
`;
  const result = compiler.compileDefinitionString(ts);
  expect(beautify(result)).toMatchSnapshot();
});

it("should handle nested namespaces", () => {
  const ts = `
import * as external from "external";

declare namespace E0 {
  type A = external.type;
  namespace U1 {
    declare var e2: number;
    enum E2 {
      E = 1,
    }
    namespace S2 {
      type S3 = E2;
      declare var n3: symbol;
      class N3 {}
    }
    namespace N2 {
      declare function s3(): void;
      declare type S3 = number;
    }
  }
  namespace S1 {
    type A2 = U1.E2;
    type B2 = U1.E2.E;
    declare var m3: string;
  }
  declare var s1: string;
}  
`;
  const result = compiler.compileDefinitionString(ts);
  expect(beautify(result)).toMatchSnapshot();
});
