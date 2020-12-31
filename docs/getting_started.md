Hey so you want to take a look at fixing your bug, we have three steps:

* Clone the repo:

  ```sh
  git clone https://github.com/joarwilk/flowgen.git
  cd flowgen
  ```

* Setup dependencies

  ```sh
  yarn install
  ```

* Run tests

  ```sh
  yarn test
  ```

From there you should add a new test file with a chunk of your TypeScript interface. For example, I created the file `src/__tests__/union_strings.spec.js` and added

```js
import { compiler, beautify } from "..";
import "./matchers";

it('should handle union strings', () => {
  const ts = `
  interface MyObj {
    state?: "APPROVED" | "REQUEST_CHANGES" | "COMMENT" | "PENDING"
  }
`;

  const result = compiler.compileDefinitionString(ts);

  expect(beautify(result)).toMatchSnapshot()
  expect(result).toBeValidFlowTypeDeclarations();
});
```

Running `yarn test` created a snapshot like this:

```js
// Jest Snapshot v1, https://goo.gl/fbAQLP

exports[`should handle union strings 1`] = `
"declare interface MyObj {
    state?: 'APPROVED' | 'REQUEST_CHANGES' | 'COMMENT' | 'PENDING'
}"
`;
```

Which I could then use as a reference for the output. You can replace the string in `ts` with whatever broken interface code you have in a new spec file and you'll have a full integration test for your changes. You can see this in commit [ccfbea](https://github.com/joarwilk/flowgen/commit/ccfbeaa189b14ee70f675601c731bf3c7cb6a88b).
