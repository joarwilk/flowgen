/* @flow */

import fs from "fs";

/**
 * Takes a path and some content and performs a write call. Simple.
 */
export default function exportDefault(fileName: string, output: string) {
  fs.writeFileSync(fileName, output);

  return fileName;
}
