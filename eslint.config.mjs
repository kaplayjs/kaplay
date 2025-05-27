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
        },
        files: ["./src/**/*.ts"],
    },
);
