//@flow

export type Options = {|
  jsdoc?: boolean,
  interfaceRecords?: boolean,
  moduleExports?: boolean,
  quiet?: boolean,
|};

const defaultOptions: Options = Object.freeze({
  jsdoc: true,
  interfaceRecords: false,
  moduleExports: true,
  quiet: false,
});

let options: Options = { ...defaultOptions };

export function assignOptions(newOptions: $Shape<Options>): void {
  Object.assign(options, newOptions);
}

export function resetOptions(): void {
  Object.assign(options, defaultOptions);
}

export function opts(): Options {
  return options;
}
