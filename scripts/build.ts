// @ts-check

import { build } from "./lib/build.ts";
import { genGlobalDTS } from "./lib/globaldts.ts";

await build();
await genGlobalDTS();
