/* @flow */

// Please add only built-in type references

const identifiers = {
  ReadonlyArray: "$ReadOnlyArray",
  Partial: "$Shape",
  Readonly: "$ReadOnly",
  NonNullable: "$NonMaybeType",
};

// TODO: Object.entries should be fixed when Flow will switch to exact by default
// We use Map, so it doesn't fail with `toString` identifier
const identifiersMap: Map<string, string> = new Map(
  (Object.entries(identifiers): any),
);

export const print = (kind: string): string => {
  return identifiersMap.get(kind) || kind;
};
