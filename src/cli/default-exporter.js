/* @flow */

import fs from "fs";
import shell from "shelljs";
import path from "path";

/**
 * Takes a path and some content and performs a write call. Simple.
 */
export default function exportDefault(
  fileName: string,
  output: string,
): string {
  const folderName = path.dirname(fileName);
  if (!fs.existsSync(folderName)) {
    shell.mkdir("-p", folderName);
  }
  fs.writeFileSync(fileName, output);

  return fileName;
}
