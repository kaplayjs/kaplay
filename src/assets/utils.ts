import { assets } from "../kaplay";
import { isDataURL } from "../utils";

export function fixURL<D>(url: D): D {
    if (typeof url !== "string" || isDataURL(url)) return url;
    return assets.urlPrefix + url as D;
}
