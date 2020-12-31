import { compiler, beautify } from "..";
import "../test-matchers";

it("should handle react types", () => {
  const ts = `
import type {ReactNode} from 'react'
import * as React from 'react'
declare function s(node: ReactNode): void;
declare function s(node: React.ReactNode): void;
`;
  const result = compiler.compileDefinitionString(ts, { quiet: true });
  expect(beautify(result)).toMatchSnapshot();
  expect(result).toBeValidFlowTypeDeclarations();
});

describe("should handle global types", () => {
  test("jsx", () => {
    const ts = `
import * as React from 'react'
declare function s(node: JSX.Element): void;

type Props = {children: JSX.Element}

declare class Component extends React.Component<Props> {
  render(): JSX.Element
}
`;
    const result = compiler.compileDefinitionString(ts, { quiet: true });
    expect(beautify(result)).toMatchSnapshot();
    expect(result).toBeValidFlowTypeDeclarations();
  });
});
