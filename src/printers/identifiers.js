/* @flow */

// Please add only built-in type references

const identifiers = Object.create(null);
Object.assign(identifiers, {
  ReadonlyArray: "$ReadOnlyArray",
  Partial: "$Shape",
  Readonly: "$ReadOnly",
  NonNullable: "$NonMaybeType",
  ReturnType: "$Call",
});

export const print = (kind: string): string => {
  return identifiers[kind] || kind;
};
