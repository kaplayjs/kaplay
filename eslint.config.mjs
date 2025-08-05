// @ts-check

import jsdoc from "eslint-plugin-jsdoc";
import tseslint from "typescript-eslint";

export default tseslint.config(
    tseslint.configs.base,
    {
        plugins: {
            jsdoc,
        },
        rules: {
            "jsdoc/require-hyphen-before-param-description": "error",
            "jsdoc/check-alignment": "warn",
            "jsdoc/check-tag-names": ["error", {
                "definedTags": ["group", "subgroup", "experimental"],
            }],
            "jsdoc/sort-tags": ["error", {
                tagSequence: [{
                    tags: [
                        "deprecated",
                        "ignore",
                    ],
                }, {
                    tags: [
                        "param",
                    ],
                }, {
                    tags: [
                        "template",
                    ],
                }, {
                    tags: [
                        "example",
                    ],
                }, {
                    tags: [
                        "default",
                        "readonly",
                        "static",
                        "returns",
                        "since",
                        "group",
                        "subgroup",
                        "experimental",
                    ],
                }],
            }],
        },
        files: ["./src/**/*.ts"],
    },
);
