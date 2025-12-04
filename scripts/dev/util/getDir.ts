import fs from "fs/promises";
import path from "path"

export async function getDirBasenames(dir: string, ext: string = ""): Promise<string[]> {
  const subdirs = await fs.readdir(dir);

  const files = await Promise.all(subdirs.map(async (subdir): Promise<string | string[]> => {
    const res = path.resolve(dir, subdir);
    const isDirectory = (await fs.stat(res)).isDirectory()
    
    if(isDirectory) {
      return getDirBasenames(res);
    }

    const dirFromTests = path.relative(path.join("tests"), res);

    return dirFromTests; 
  }));

  return files.flat();
}
