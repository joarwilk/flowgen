# Flowgen

## The state of the converter
It's surprisingly robust and non-lossy as it stands right now, in big part thanks to how similar flow and typescript definition files are. Please see the output in [this flow-typed PR](https://github.com/flowtype/flow-typed/pull/590) for the state of the output.

## Usage

Install using `npm i flowgen --save`

```js
import { compiler } from 'flowgen';

// To compile a d.ts file
const flowdef = compiler.compileDefinitionFile(filename);

// To compile a string
const flowdef = compiler.compileDefinitionString(str);

// To compile a typescript test file to JavaScript
// esTarget = ES5/ES6 etc
const testCase = compiler.compileTest(path, esTarget)
```

*Recommended second step:*

```js
import { beautify } from 'flowgen';

// Make the definition human readable
const readableDef = beautify(generatedFlowdef);
```

### CLI

Standard usage (will produce `export.flow.js`):
```
npm i -g flowgen
flowgen lodash.d.ts
```

### Options
```
-o / --output-file [outputFile]: Specifies the filename of the exported file, defaults to export.flow.js
```

### Flags for specific cases
```
--flow-typed-format: Format output so it fits in the flow-typed repo
--compile-tests: Compile any sibling <filename>-tests.ts files found
--add-flow-header: Add `// @flow` to generated files. Should be used for libs.
```


## The difficult parts

### Namespaces
Namespaces have been a big headache. What it does right now is that it splits any namespace out into prefixed global scope declarations instead. It works OK, but its not pretty and there's some drawbacks to it.

### External library imports
Definitions in TS and flow are often quite different, and imported types from other libraries dont usually have
a one-to-one mapping. Common cases are `React.ReactElement`, `React.CSSProps`etc.
This might require manual processing, or we add a set of hardcoded mutations that handle common cases.

### Odd TS conventions
[Lodash](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/9fb1696ad55c0ac54bbf6e477f21b52536211a1e/types/lodash/index.d.ts) has been one of the reference libraries i've worked with when creating the
converter. The definition is mostly just a series of interfaces with the same name being re-declared over and over again for each function, which doesn't translate to flow at all. There's multiple ways of solving this but I dont have a great solution for it in place yet.

## Contributing

All help is appreciated. Please [tweet at me](https://twitter.com/joarwilk) if you want some help getting started, or just want to discuss ideas on how to solve the trickier parts.

## Distribution

* `git pull origin master`
* `yarn compile`
* Change the version in `package.json`
* `git add .`
* `git commit -m "New release"
* `npm publish`
* `git push`
