import {
    DEF_FONT_FILTER,
    DEF_TEXT_CACHE_SIZE,
    MAX_TEXT_CACHE_SIZE,
} from "./constants";
import { rgb } from "./math";
import type { LoadFontOpt, Outline, TexFilter } from "./types";

export class FontData {
    fontface: FontFace;
    filter: TexFilter = DEF_FONT_FILTER;
    outline: Outline | null = null;
    size: number = DEF_TEXT_CACHE_SIZE;
    constructor(face: FontFace, opt: LoadFontOpt = {}) {
        this.fontface = face;
        this.filter = opt.filter ?? DEF_FONT_FILTER;
        this.size = opt.size ?? DEF_TEXT_CACHE_SIZE;
        if (this.size > MAX_TEXT_CACHE_SIZE) {
            throw new Error(`Max font size: ${MAX_TEXT_CACHE_SIZE}`);
        }
        if (opt.outline) {
            this.outline = {
                width: 1,
                color: rgb(0, 0, 0),
            };
            if (typeof opt.outline === "number") {
                this.outline.width = opt.outline;
            } else if (typeof opt.outline === "object") {
                if (opt.outline.width) {
                    this.outline.width = opt.outline.width;
                }
                if (opt.outline.color) {
                    this.outline.color = opt.outline.color;
                }
            }
        }
    }
}
