// @ts-check

import { build } from "./lib/build.js";
import { genGlobalDTS } from "./lib/globaldts.js";

await build();
await genGlobalDTS();
