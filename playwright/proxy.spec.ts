import { expect, test } from "@playwright/test";
import fs from "fs";
import path from "path";

test("multipart-form upload", async ({ request }) => {
    const bitmap = fs.readFileSync(path.join(__dirname, "assets", "david_hume.jpeg"));
    const base64Image = bitmap.toString("base64");
    const mimeType = "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${base64Image}`;
    const r = await request.post("http://localhost:3000/api/fern-docs/proxy", {
        data: {
            url: "https://api.hume.ai/v0/batch/jobs",
            method: "POST",
            headers: {
                "X-Hume-Api-Key": process.env.HUME_API_KEY ?? "",
                "Content-Type": "multipart/form-data",
            },
            body: {
                type: "form-data",
                value: {
                    file: {
                        type: "file",
                        value: {
                            name: "david_hume.jpg",
                            lastModified: 1699633808160,
                            size: 42777,
                            type: mimeType,
                            dataUrl,
                        },
                    },
                },
            },
        },
    });

    const response = await r.json();

    expect(response.error).toEqual(false);
    expect(response.response.status).toEqual(200);
});
