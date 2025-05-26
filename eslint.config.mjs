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
            "jsdoc/require-jsdoc": "warn",
        },
        files: ["./src/**/*.ts"],
    },
);
