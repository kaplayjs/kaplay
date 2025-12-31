// @ts-check

import { build } from "./lib/build.ts";
import { genGlobalDTS } from "./lib/globaldts.ts";

const fastModeArg = process.argv[2];
const fastMode = fastModeArg == "--fast";

await build(fastMode);
await genGlobalDTS();
