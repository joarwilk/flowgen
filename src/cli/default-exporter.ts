import fs from "fs";
import shell from "shelljs";
import path from "path";
import { promisify } from "./util";

const open: (
  filename: string,
  flags: string | number,
) => Promise<number> = promisify(fs.open);
const writeFile: (fd: number, output: string) => Promise<void> = promisify(
  fs.writeFile,
);

/**
 * Takes a path and some content and performs a write call. Simple.
 */
export default async function exportDefault(
  fileName: string,
  output: string,
  _index: number,
): Promise<string> {
  const folderName = path.dirname(fileName);
  let handle;
  try {
    handle = await open(fileName, "w");
  } catch {
    shell.mkdir("-p", folderName);
    handle = await open(fileName, "w");
  }
  await writeFile(handle, output);
  return fileName;
}
