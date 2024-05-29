import { readdirSync } from "node:fs";
import * as path from "node:path";
import * as fs from "node:fs/promises";

export function getSubDirectoriesInDirectorySync(path: string) {
  const entries = readdirSync(path, { withFileTypes: true });
  const names = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
  return names;
}

export function getFilesInDirectorySync(path: string) {
  const entries = readdirSync(path, { withFileTypes: true });
  const names = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name);
  return names;
}

export async function getFilesInDirectory(path: string) {
  const entries = await fs.readdir(path, { withFileTypes: true });
  const names = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name);
  return names;
}

export async function getSubDirectoriesInDirectory(path: string) {
  const entries = await fs.readdir(path, { withFileTypes: true });
  const names = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
  return names;
}

export async function getAllFilesInDirectoryRecursively({
  dirPath,
  files = [],
}: {
  dirPath: string;
  files?: string[];
}) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const nextPath = path.join(dirPath, entry.name);
      const filesInDir = await getAllFilesInDirectoryRecursively({
        dirPath: nextPath,
        files,
      });
      files.concat(filesInDir);
    } else {
      const filePath = path.join(dirPath, entry.name);
      files.push(filePath);
    }
  }
  return Promise.resolve(files);
}
