import { parse } from "node-html-parser";
import { existsSync } from "node:fs";
import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import readdirp from "readdirp";

const SRC_DIR = "../docs-bundle/out";
const OUT_DIR = "dist";
const ASSETS_DIR = path.join("_next", "static");

// copy all static assets
await cp(path.join(SRC_DIR, ASSETS_DIR), OUT_DIR, { recursive: true });

// read in all static html files
const entries = await readdirp.promise(path.join(SRC_DIR, "static"), {
    fileFilter: "*.html",
});

// iterate over static html output and inject the content into the template
for (const entry of entries) {
    // read + parse the html template
    const template = await readFile("./template.html", "utf8").then(parse);

    // read + parse the static html file
    const root = await readFile(entry.fullPath, "utf8").then(parse);

    const body = root.querySelector("body");
    if (body) {
        template.querySelector("main")?.replaceWith(...body.childNodes);
    }

    const title = root.querySelector("title");
    if (title) {
        template.querySelector("title")?.set_content(title.text);
    }

    root.querySelectorAll("head > link").forEach((node) => {
        const href = node.getAttribute("href");

        if (href?.startsWith("/")) {
            const relativePath = path.relative(path.dirname(entry.path), href.replace(`/${ASSETS_DIR}/`, ""));
            node.setAttribute("href", relativePath);
        }

        template.querySelector("head")?.appendChild(node);
    });

    root.querySelectorAll("head > script").forEach((node) => {
        const src = node.getAttribute("src");

        if (src?.startsWith("/")) {
            const relativePath = path.relative(path.dirname(entry.path), src.replace(`/${ASSETS_DIR}/`, ""));
            node.setAttribute("src", relativePath);
        }

        template.querySelector("head")?.appendChild(node);
    });

    const dir = path.join(OUT_DIR, path.dirname(entry.path));
    if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true });
    }

    await writeFile(path.join(OUT_DIR, entry.path), template.toString());
}
