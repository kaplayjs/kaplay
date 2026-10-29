import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

export function checkPublicTypes(body: string) {
    const dir = mkdtempSync(join(tmpdir(), "public-types-"));
    const filename = join(dir, "consumer.ts");
    const modulePath = resolve("dist/doc").replaceAll("\\", "/");
    writeFileSync(
        filename,
        `import kaplay from ${
            JSON.stringify(modulePath)
        };\nconst k = kaplay();\n${body}`,
    );
    try {
        execFileSync(process.execPath, [
            "node_modules/typescript/bin/tsc",
            "--noEmit",
            "--strict",
            "--skipLibCheck",
            "--module",
            "esnext",
            "--target",
            "esnext",
            "--moduleResolution",
            "bundler",
            filename,
        ], { encoding: "utf8", stdio: "pipe" });
    } catch (error) {
        const failure = error as Error & { stdout?: string; stderr?: string };
        throw new Error(
            [failure.message, failure.stdout, failure.stderr].filter(Boolean)
                .join("\n"),
        );
    } finally {
        rmSync(dir, { recursive: true });
    }
}
