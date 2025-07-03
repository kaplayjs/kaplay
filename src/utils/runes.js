"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runes = runes;
exports.substring = substring;
var GRAPHEMES = Object.freeze([
    0x0308, // ( ◌̈ ) COMBINING DIAERESIS
    0x0937, // ( ष ) DEVANAGARI LETTER SSA
    0x093F, // ( ि ) DEVANAGARI VOWEL SIGN I
    0x0BA8, // ( ந ) TAMIL LETTER NA
    0x0BBF, // ( ி ) TAMIL VOWEL SIGN I
    0x0BCD, // ( ◌்) TAMIL SIGN VIRAMA
    0x0E31, // ( ◌ั ) THAI CHARACTER MAI HAN-AKAT
    0x0E33, // ( ำ ) THAI CHARACTER SARA AM
    0x0E40, // ( เ ) THAI CHARACTER SARA E
    0x0E49, // ( เ ) THAI CHARACTER MAI THO
    0x1100, // ( ᄀ ) HANGUL CHOSEONG KIYEOK
    0x1161, // ( ᅡ ) HANGUL JUNGSEONG A
    0x11A8, // ( ᆨ ) HANGUL JONGSEONG KIYEOK
]);
var EnumCodeUnits;
(function (EnumCodeUnits) {
    EnumCodeUnits[EnumCodeUnits["unit_1"] = 1] = "unit_1";
    EnumCodeUnits[EnumCodeUnits["unit_2"] = 2] = "unit_2";
    EnumCodeUnits[EnumCodeUnits["unit_4"] = 4] = "unit_4";
})(EnumCodeUnits || (EnumCodeUnits = {}));
function runes(string) {
    if (typeof string !== "string") {
        throw new TypeError("string cannot be undefined or null");
    }
    var result = [];
    var i = 0;
    var increment = 0;
    while (i < string.length) {
        increment += nextUnits(i + increment, string);
        if (isGrapheme(string[i + increment])) {
            increment++;
        }
        if (isVariationSelector(string[i + increment])) {
            increment++;
        }
        if (isDiacriticalMark(string[i + increment])) {
            increment++;
        }
        if (isZeroWidthJoiner(string[i + increment])) {
            increment++;
            continue;
        }
        result.push(string.substring(i, i + increment));
        i += increment;
        increment = 0;
    }
    return result;
}
// Decide how many code units make up the current character.
// BMP characters: 1 code unit
// Non-BMP characters (represented by surrogate pairs): 2 code units
// Emoji with skin-tone modifiers: 4 code units (2 code points)
// Country flags: 4 code units (2 code points)
// Variations: 2 code units
// Subdivision flags: 14 code units (7 code points)
function nextUnits(i, string) {
    var current = string[i];
    // If we don't have a value that is part of a surrogate pair, or we're at
    // the end, only take the value at i
    if (!isFirstOfSurrogatePair(current) || i === string.length - 1) {
        return EnumCodeUnits.unit_1;
    }
    var currentPair = current + string[i + 1];
    var nextPair = string.substring(i + 2, i + 5);
    // Country flags are comprised of two regional indicator symbols,
    // each represented by a surrogate pair.
    // See http://emojipedia.org/flags/
    // If both pairs are regional indicator symbols, take 4
    if (isRegionalIndicator(currentPair) && isRegionalIndicator(nextPair)) {
        return EnumCodeUnits.unit_4;
    }
    // https://unicode.org/emoji/charts/full-emoji-list.html#subdivision-flag
    // See https://emojipedia.org/emoji-tag-sequence/
    // If nextPair is in Tags(https://en.wikipedia.org/wiki/Tags_(Unicode_block)),
    // then find next closest U+E007F(CANCEL TAG)
    if (isSubdivisionFlag(currentPair)
        && isSupplementarySpecialpurposePlane(nextPair)) {
        return string.slice(i).indexOf(String.fromCodePoint(917631 /* EnumRunesCode.TAGS_END */)) + 2;
    }
    // If the next pair make a Fitzpatrick skin tone
    // modifier, take 4
    // See http://emojipedia.org/modifiers/
    // Technically, only some code points are meant to be
    // combined with the skin tone modifiers. This function
    // does not check the current pair to see if it is
    // one of them.
    if (isFitzpatrickModifier(nextPair)) {
        return EnumCodeUnits.unit_4;
    }
    return EnumCodeUnits.unit_2;
}
function isFirstOfSurrogatePair(string) {
    return string
        && betweenInclusive(string[0].charCodeAt(0), 55296 /* EnumRunesCode.HIGH_SURROGATE_START */, 56319 /* EnumRunesCode.HIGH_SURROGATE_END */);
}
function isRegionalIndicator(string) {
    return betweenInclusive(codePointFromSurrogatePair(string), 127462 /* EnumRunesCode.REGIONAL_INDICATOR_START */, 127487 /* EnumRunesCode.REGIONAL_INDICATOR_END */);
}
function isSubdivisionFlag(string) {
    return betweenInclusive(codePointFromSurrogatePair(string), 127988 /* EnumRunesCode.SUBDIVISION_INDICATOR_START */, 127988 /* EnumRunesCode.SUBDIVISION_INDICATOR_START */);
}
function isFitzpatrickModifier(string) {
    return betweenInclusive(codePointFromSurrogatePair(string), 127995 /* EnumRunesCode.FITZPATRICK_MODIFIER_START */, 127999 /* EnumRunesCode.FITZPATRICK_MODIFIER_END */);
}
function isVariationSelector(string) {
    return typeof string === "string"
        && betweenInclusive(string.charCodeAt(0), 65024 /* EnumRunesCode.VARIATION_MODIFIER_START */, 65039 /* EnumRunesCode.VARIATION_MODIFIER_END */);
}
function isDiacriticalMark(string) {
    return typeof string === "string"
        && betweenInclusive(string.charCodeAt(0), 8400 /* EnumRunesCode.DIACRITICAL_MARKS_START */, 8447 /* EnumRunesCode.DIACRITICAL_MARKS_END */);
}
function isSupplementarySpecialpurposePlane(string) {
    var codePoint = string.codePointAt(0);
    return (typeof string === "string" && typeof codePoint === "number"
        && betweenInclusive(codePoint, 917504 /* EnumRunesCode.TAGS_START */, 917631 /* EnumRunesCode.TAGS_END */));
}
function isGrapheme(string) {
    return typeof string === "string"
        && GRAPHEMES.includes(string.charCodeAt(0));
}
function isZeroWidthJoiner(string) {
    return typeof string === "string"
        && string.charCodeAt(0) === 8205 /* EnumRunesCode.ZWJ */;
}
function codePointFromSurrogatePair(pair) {
    var highOffset = pair.charCodeAt(0) - 55296 /* EnumRunesCode.HIGH_SURROGATE_START */;
    var lowOffset = pair.charCodeAt(1) - 56320 /* EnumRunesCode.LOW_SURROGATE_START */;
    return (highOffset << 10) + lowOffset + 0x10000;
}
function betweenInclusive(value, lower, upper) {
    return value >= lower && value <= upper;
}
function substring(string, start, width) {
    var chars = runes(string);
    if (start === undefined) {
        return string;
    }
    if (start >= chars.length) {
        return "";
    }
    var rest = chars.length - start;
    var stringWidth = width === undefined ? rest : width;
    var endIndex = start + stringWidth;
    if (endIndex > (start + rest)) {
        endIndex = null;
    }
    if (endIndex === null) {
        return chars.slice(start).join("");
    }
    return chars.slice(start, endIndex).join("");
}
