/* @flow */
import compiler from '../compiler';

it('should handle maybe & nullable type', () => {
  const result = compiler.compileDefinitionString('let a: string | null | undefined');

  expect(result).toMatchSnapshot();
});

it('should handle bounded polymorphism', () => {
  const ts = `
    function fooGood<T extends { x: number }>(obj: T): T {
      console.log(Math.abs(obj.x));
      return obj;
    }
  `;

  const result = compiler.compileDefinitionString(ts);

  expect(result).toMatchSnapshot();
});


it('should handle union strings', () => {
  const ts = `
    interface MyObj {
      state?: "APPROVED" | "REQUEST_CHANGES" | "COMMENT" | "PENDING"
    }
  `;

  const result = compiler.compileDefinitionString(ts);

  expect(result).toMatchSnapshot();
});
