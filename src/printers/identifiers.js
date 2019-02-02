/* @flow */

const identifiers = {
  ReadonlyArray: "$ReadOnlyArray",
};

export const print = (kind: string): string => {
  return identifiers[kind] || kind;
};
