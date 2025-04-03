import { MAX_TEXT_CACHE_SIZE } from "../constants";

export const createFontCache = () => {
    const fontCacheCanvas = document.createElement("canvas");
    fontCacheCanvas.width = MAX_TEXT_CACHE_SIZE;
    fontCacheCanvas.height = MAX_TEXT_CACHE_SIZE;
    const fontCacheC2d = fontCacheCanvas.getContext("2d", {
        willReadFrequently: true,
    });

    return {
        fontCacheCanvas,
        fontCacheC2d,
    };
};
