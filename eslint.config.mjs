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
                "definedTags": ["group", "experimental"],
            }],
            "jsdoc/sort-tags": ["error", {
                tagSequence: [{
                    tags: [
                        "deprecated",
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
                        "experimental",
                    ],
                }],
            }],
        },
        files: ["./src/**/*.ts"],
    },
);
