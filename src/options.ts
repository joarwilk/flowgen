export type Options = {
  jsdoc?: boolean;
  interfaceRecords?: boolean;
  moduleExports?: boolean;
  quiet?: boolean;
  inexact?: boolean;
  asModule?: string;
};

const defaultOptions: Options = Object.freeze({
  jsdoc: true,
  interfaceRecords: false,
  moduleExports: true,
  quiet: false,
  inexact: true,
});

const options: Options = { ...defaultOptions };

export function assignOptions(newOptions: Partial<Options>): void {
  Object.assign(options, newOptions);
}

export function resetOptions(): void {
  Object.assign(options, defaultOptions);
}

export function opts(): Options {
  return options;
}
