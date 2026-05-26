const isBrowser = process.env.IS_BROWSER;

/**
 * @type {import("puppeteer").Configuration}
 */
export default {
    launch: {
        headless: isBrowser ? false : true,
    },
};
