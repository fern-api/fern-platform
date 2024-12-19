import { expect, test } from "@playwright/test";
import fs from "fs";
import path from "path";

test.skip("multipart-form upload", async ({ request }) => {
    const bitmap = fs.readFileSync(
        path.join(__dirname, "assets", "david_hume.jpeg")
    );
    const base64Image = bitmap.toString("base64");
    const mimeType = "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${base64Image}`;
    const r = await request.post("/api/fern-docs/proxy/rest", {
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

test.skip("json request", async ({ request }) => {
    const r = await request.post("/api/fern-docs/proxy/rest", {
        data: {
            url: "https://registry.buildwithfern.com/v2/registry/docs/load-with-url",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.FERN_TOKEN}`,
            },
            body: {
                type: "json",
                value: {
                    url: "fern.docs.buildwithfern.com",
                },
            },
        },
    });

    const response = await r.json();

    expect(response.response.ok).toEqual(true);
    const headers = new Headers(response.response.headers);
    expect(headers.get("content-type")).toEqual(
        "application/json; charset=utf-8"
    );
});
