const isBrowser = process.env.IS_BROWSER;

console.log(isBrowser);
/**
 * @type {import("puppeteer").Configuration}
 */
export default {
    launch: {
        headless: isBrowser ? false : true,
    },
};
