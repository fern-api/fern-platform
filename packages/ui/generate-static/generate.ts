import { parse } from "node-html-parser";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import readdirp from "readdirp";

const OUT_DIR = "dist";

const template = await readFile("./template.html", "utf8").then(parse);

const entries = await readdirp.promise("../docs-bundle/out/static", {
    fileFilter: "*.html",
});

for (const entry of entries) {
    const root = await readFile(entry.fullPath, "utf8").then(parse);

    const main = root.querySelector("main");
    if (main) {
        template.querySelector("main")?.set_content(main.childNodes);
    }

    const title = root.querySelector("title");
    if (title) {
        template.querySelector("title")?.set_content(title.text);
    }

    const dir = path.join(OUT_DIR, path.dirname(entry.path));
    if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true });
    }

    await writeFile(path.join(OUT_DIR, entry.path), template.toString());
}
