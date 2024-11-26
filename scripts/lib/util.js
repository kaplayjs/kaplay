// @ts-check

import cp from "child_process";
import fs from "fs/promises";

/**
 * Write a file to disk
 *
 * @param {string} path
 * @param {string} content
 */
export async function writeFile(path, content) {
    await fs.writeFile(path, content);
    console.log(`-> ${path}`);
}

/**
 * Check if the current platform is windows
 *
 * @type {boolean}
 */
export const isWindows = /^win/.test(process.platform);

export const c = (n, msg) => `\x1b[${n}m${msg}\x1b[0m`;

/**
 * Wait for a certain amount of time
 *
 * @param {number} time
 * @returns {Promise<void>}
 */
export function wait(time) {
    return new Promise((resolve) => setTimeout(() => resolve(), time));
}

/**
 * Execute a command
 *
 * @param {string} cmd
 * @param {string[]} args
 * @param {import("child_process").SpawnOptions} opts
 */
export const exec = async (cmd, args, opts) =>
    new Promise((resolve, reject) => {
        const proc = cp.spawn(isWindows ? cmd + ".cmd" : cmd, args, opts);
        proc.on("exit", resolve);
        proc.on("error", reject);
    });

/**
 * Check if a file exists
 *
 * @param {string} path
 * @returns {Promise<boolean>}
 */
export const exists = (path) =>
    fs.access(path).then(() => true).catch(() => false);

/**
 * Check if a path is a file
 *
 * @param {string} path
 * @returns {Promise<boolean>}
 */
export const isFile = (path) =>
    fs.stat(path).then((stat) => stat.isFile()).catch(() => false);

/**
 * Check if a path is a directory
 *
 * @param {string} path
 * @returns {Promise<boolean>}
 */
export const isDir = (path) =>
    fs.stat(path).then((stat) => stat.isDirectory()).catch(() => false);
