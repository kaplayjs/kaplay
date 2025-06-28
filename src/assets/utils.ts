import { _k } from "../shared";
import { isDataURL } from "../utils/dataURL";

export function fixURL<D>(url: D): D {
    if (typeof url == "string" && window.kaplayjs_assetsAliases[url]) {
        url = (window.kaplayjs_assetsAliases[url] as unknown) as D;
    }

    if (typeof url !== "string" || isDataURL(url)) return url;
    return _k.assets.urlPrefix + url as D;
}
