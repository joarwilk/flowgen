# Flowgen

## The state of the converter
It's surprisingly robust and non-lossy as it stands right now, in big part thanks to how similar flow and typescript definition files are. Please see the output in [this flow-typed PR](https://github.com/flowtype/flow-typed/pull/590) for the state of the output.

| Supported? | Syntax | TypeScript | Flow |
|---|---|---|---|
| ✅ | Void type | `void` | `void` |
| ✅ | Undefined type | `undefined` | `void` |
| ✅ | Unknown type | `unknown` | `mixed` |
| ✅ | Symbol type | `symbol` | `Symbol` |
|    | Unique symbol type | `unique symbol` | `Symbol` |
| ✅ | Object type | `object` | `{[key: string]: any}` |
| ✅ | Never type | `never` | `empty` |
| ✅ | Variance | `interface A { readonly b: B, c: C }` | `interface A { +b: B, c: C }` |
| ✅ | Functions | `(a: A, b: B) => C` | `(a: A, b: B) => C` |
| ✅ | Indexers | `{[k: string]: string}` | `{[k: string]: string}` |
|    | This type | `(this: X, a: A, b: B) => C` | `(a: A, b: B) => C` |
|    | Type guards | `(a: X) => a is A` | `(a: X) => boolean` |
| ✅ | Type parameter bounds | `function f<A extends string>(a:A){}` | `function f<A: string>(a:A){}` |
| ✅ | keyof X | `keyof X` | `$Keys<X>` |
| ✅ | X[keyof X] | `X[keyof X]` | `$ElementType<X, $Keys<X>>` |
| ✅ | Partial | `Partial<X>` | `$Rest<X, {}>` |
| ✅ | Readonly | `Readonly<X>` | `$ReadOnly<X>` |
| ✅ | ReadonlyArray | `ReadonlyArray<X>` | `$ReadOnlyArray<X>` |
| ✅ | ReadonlySet | `ReadonlySet<X>` | `$ReadOnlySet<X>` |
| ✅ | ReadonlyMap | `ReadonlyMap<X, Y>` | `$ReadOnlyMap<X, Y>` |
| ✅ | Record | `Record<K, T>` | `{ [key: K]: T }` |
|    | Pick | `Pick<T, K>` |  |
|    | Exclude | `Exclude<T, U>` |  |
|    | Extract | `Extract<T, U>` |  |
| ✅ | NonNullable | `NonNullable<X>` | `$NonMaybeType<X>` |
| ✅ | ReturnType | `ReturnType<F>` | `$Call<<R>((...args: any[]) => R) => R, F>` |
|    | InstanceType | `InstanceType<X>` |  |
|    | Required | `Required<X>` |  |
|    | ThisType | `ThisType<X>` |  |
| ✅ | T['string'] | `T['string']` | `$PropertyType<T, k>` |
| ✅ | T[k] | `T[k]` | `$ElementType<T, k>` |
| ✅ | Mapped types | `{[K in keyof Obj]: Obj[K]}` | `$ObjMapi<Obj, <K>(K) => $ElementType<Obj, K>>` |
|    | Conditional types | `A extends B ? C : D` | `any` |
| ✅ | typeof operator | `typeof foo` | `typeof foo` |
| ✅ | Tuple type | `[number, string]` | `[number, string]` |
| ✅ | Type alias | `type A = string` | `type A = string` |
| ✅ | type/typeof import | `import A from 'module'` | `import type A from 'module'` |

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
--no-inexact: Do not mark object types as inexact (using `...`)
--no-module-exports: Convert `export = Type` only to default export, instead of `declare module.exports: Type`
--interface-records: Convert TypeScript interfaces to Exact Objects
--no-jsdoc: Ignore TypeScript JSDoc
--add-flow-header: Add `// @flow` to generated files. Should be used for libs.
```

## The difficult parts

### Namespaces
Namespaces have been a big headache. What it does right now is that it splits any namespace out into prefixed global scope declarations instead. It works OK, but its not pretty and there's some drawbacks to it.

### External library imports
Definitions in TS and flow are often quite different, and imported types from other libraries don't usually have
a one-to-one mapping. Common cases are `React.ReactElement`, `React.CSSProps`etc.
This might require manual processing, or we add a set of hardcoded mutations that handle common cases.

### Odd TS conventions
[Lodash](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/9fb1696ad55c0ac54bbf6e477f21b52536211a1e/types/lodash/index.d.ts) has been one of the reference libraries i've worked with when creating the
converter. The definition is mostly just a series of interfaces with the same name being re-declared over and over again for each function, which doesn't translate to flow at all. There's multiple ways of solving this but I don't have a great solution for it in place yet.

### Sample of finding all typescript definition files and generate flow file with shell script
If your typescript definition files are built in `lib` add below shell script and run it.

```sh
for i in $(find lib -type f -name "*.d.ts");
  do sh -c "flowgen $i -o ${i%.*.*}.js.flow";
done;
```

So if you have definition files in different dir, you can rename `lib` and run the script.

Here’s an example of the above as an npm script in `package.json` that excludes any typescript definition files found inside `node_modules`:
```json
  "scripts": {
    "build:flowtypes": "find . -type f -not -path './node_modules/*' -name '*.d.ts' -exec sh -c 'yarn flowgen --add-flow-header $1 -o ${1%.*.*}.js.flow' _ '{}' \\;"
  }
```

You can then have a `build` script that generates flow types along the lines of `tsc --build && npm run build:flowtypes`.

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
