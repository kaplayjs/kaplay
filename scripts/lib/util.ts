// @ts-check

import cp, { type SpawnOptions } from "child_process";
import fs from "fs/promises";

/**
 * Write a file to disk
 */
export async function writeFile(path: string, content: string) {
    await fs.writeFile(path, content);
    console.log(`-> ${path}`);
}

/**
 * Check if the current platform is windows
 */
export const isWindows = /^win/.test(process.platform);

export const c = (n: string, msg: string) => `\x1b[${n}m${msg}\x1b[0m`;

/**
 * Wait for a certain amount of time
 */
export function wait(time: number) {
    return new Promise((resolve) => setTimeout(() => resolve(0), time));
}

/**
 * Execute a command
 */
export const exec = async (cmd: string, args: string[], opts: SpawnOptions) =>
    new Promise((resolve, reject) => {
        const proc = cp.spawn(isWindows ? cmd + ".cmd" : cmd, args, opts);
        proc.on("exit", resolve);
        proc.on("error", reject);
    });

/**
 * Check if a file exists
 */
export const exists = (path: string) =>
    fs.access(path).then(() => true).catch(() => false);

/**
 * Check if a path is a file
 */
export const isFile = (path: string) =>
    fs.stat(path).then((stat) => stat.isFile()).catch(() => false);

/**
 * Check if a path is a directory
 */
export const isDir = (path: string) =>
    fs.stat(path).then((stat) => stat.isDirectory()).catch(() => false);
