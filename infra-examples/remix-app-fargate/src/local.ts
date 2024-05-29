import { getAllFilesInDirectoryRecursively } from "./util/dir";

// write whatever you want to run in local in this function
async function main() {
  const files = await getAllFilesInDirectoryRecursively({
    dirPath: "./public",
  });
  console.log({ files });
}

main();
