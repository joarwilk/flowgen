import { compiler, beautify } from "..";
import "../test-matchers";

it("should not crash when getting globalThis in code", () => {
  const ts = `import * as React from 'react';
export default class MenuStatefulContainer extends React.Component {
  handleItemClick: (
    event: React.MouseEvent<HTMLElement, globalThis.MouseEvent>
  ) => void;
  render(): React.ReactNode;
}
`;
  const result = compiler.compileDefinitionString(ts, { quiet: true });
  expect(beautify(result)).toMatchSnapshot();
  expect(result).not.toBeValidFlowTypeDeclarations(); // missing-type-arg,prop-missing
});
