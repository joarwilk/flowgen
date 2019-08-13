/* @flow */
import prettier from "prettier";

export default function beautify(str: string): string {
  return prettier.format(str, { parser: "babel-flow" });
}
