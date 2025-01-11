import { createExecutionContext, env } from "cloudflare:test";
import { describe, expect, it, vi } from "vitest";
import worker from "../src/index";

// For now, you'll need to do something like this to get a correctly-typed
// `Request` to pass to `worker.fetch()`.
const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

function methodNotAllowed() {
	return new Response("Method Not Allowed", { status: 405 });
}

function notFound() {
	return new Response("Not Found", { status: 404 });
}

function badRequest() {
	return new Response("Bad Request", { status: 400 });
}

async function fromReadableStream(
	stream: ReadableStream<Uint8Array>
): Promise<string> {
	const reader = stream.getReader();
	let toret = "";
	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		toret += new TextDecoder().decode(value);
	}
	return toret;
}

describe("rest", () => {
	it("should proxy a basic rest request", async () => {
		global.fetch = vi.fn(async ({ url, method }) => {
			if (method !== "GET") {
				return methodNotAllowed();
			}
			if (url !== "https://example.com/test") {
				return notFound();
			}
			return new Response("Success!", {
				status: 200,
				headers: { "Content-Type": "text/plain" },
			});
		});

		const request = new IncomingRequest(
			`https://proxy.ferndocs.com/https://example.com/test`
		);
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		expect(await response.text()).toMatchInlineSnapshot(`"Success!"`);
		expect(response.headers.get("Content-Type")).toBe("text/plain");
		expect(response.status).toBe(200);
		expect(response.headers.get("x-fern-proxy-response-headers")).toBe(
			"content-type"
		);
		expect(response.headers.get("x-fern-proxy-response-time")).toBeDefined();
	});

	it("should proxy with search params", async () => {
		global.fetch = vi.fn(async ({ url }) => {
			const testUrl = new URL(url);
			if (
				testUrl.origin !== "https://example.com" ||
				testUrl.pathname !== "/test" ||
				testUrl.search !== "?foo=bar&baz=qux"
			) {
				return notFound();
			}
			return new Response("Success!", {
				status: 200,
				headers: { "Content-Type": "text/plain" },
			});
		});

		const request = new IncomingRequest(
			`https://proxy.ferndocs.com/https://example.com/test?foo=bar&baz=qux`
		);
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		expect(await response.text()).toMatchInlineSnapshot(`"Success!"`);
		expect(response.headers.get("Content-Type")).toBe("text/plain");
		expect(response.status).toBe(200);
		expect(response.headers.get("x-fern-proxy-response-headers")).toBe(
			"content-type"
		);
		expect(response.headers.get("x-fern-proxy-response-time")).toBeDefined();
	});

	it("should proxy with headers", async () => {
		global.fetch = vi.fn(async ({ method, headers, body }) => {
			if (method !== "POST") {
				return methodNotAllowed();
			}
			if (headers.get("content-type") !== "application/json") {
				return badRequest();
			}
			const bodyText = await fromReadableStream(body);
			const bodyJson = JSON.parse(bodyText);
			if (bodyJson.foo !== "bar") {
				return badRequest();
			}
			return new Response("Success!", {
				status: 200,
				headers: { "Content-Type": "text/plain" },
			});
		});

		const request = new IncomingRequest(
			`https://proxy.ferndocs.com/https://example.com/test`,
			{
				method: "POST",
				headers: {
					"x-fern-proxy-request-headers": "content-type",
					"content-type": "application/json",
				},
				body: JSON.stringify({ foo: "bar" }),
			}
		);
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		expect(await response.text()).toMatchInlineSnapshot(`"Success!"`);
		expect(response.headers.get("Content-Type")).toBe("text/plain");
		expect(response.status).toBe(200);
		expect(response.headers.get("x-fern-proxy-response-headers")).toBe(
			"content-type"
		);

		// if x-fern-proxy-request-headers is not set, it doesn't get forwarded
		const request2 = new IncomingRequest(
			`https://proxy.ferndocs.com/https://example.com/test`,
			{
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ foo: "bar" }),
			}
		);

		const response2 = await worker.fetch(request2, env, ctx);
		expect(response2.status).toBe(400);
		expect(response.headers.get("x-fern-proxy-response-time")).toBeDefined();
	});

	it("should proxy multipart/form-data", async () => {
		global.fetch = vi.fn(async ({ method, headers, body }) => {
			if (method !== "POST") {
				return methodNotAllowed();
			}

			// content-type should not be set because form-data will be automatically parsed and set as multipart/form-data + boundary
			expect(headers.get("content-type")).toBeNull();
			const bodyText = await fromReadableStream(body);
			const formData = new FormData();
			const boundary = bodyText.split("\r\n")[0];
			const parts = bodyText.split(boundary).slice(1, -1);

			// parse form-data
			for (const part of parts) {
				const [header, value] = part.split("\r\n\r\n");
				const nameMatch = header.match(/name="([^"]+)"/);
				if (nameMatch) {
					const name = nameMatch[1].trim();
					const cleanValue = value.trim().replace(/\r\n--$/, "");
					formData.append(name, cleanValue);
				}
			}

			expect(formData.get("foo")).toBe("bar");

			return new Response("Success!", {
				status: 200,
				headers: { "Content-Type": "text/plain" },
			});
		});

		const formData = new FormData();
		formData.append("foo", "bar");

		const request = new IncomingRequest(
			`https://proxy.ferndocs.com/https://example.com/test`,
			{
				method: "POST",
				headers: {
					"x-fern-proxy-request-headers": "content-type",
				},
				body: formData,
			}
		);
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		expect(response.status).toBe(200);
		expect(response.headers.get("Content-Type")).toBe("text/plain");
		expect(response.headers.get("x-fern-proxy-response-headers")).toBe(
			"content-type"
		);
		expect(response.headers.get("x-fern-proxy-response-time")).toBeDefined();
	});

	it("should handle streaming responses", async () => {
		global.fetch = vi.fn(async () => {
			const stream = new ReadableStream({
				start(controller) {
					controller.enqueue(new TextEncoder().encode("Hello, "));

					setTimeout(() => {
						controller.enqueue(new TextEncoder().encode("Success!"));
						controller.close();
					}, 500); // 1 second delay
				},
			});

			return new Response(stream, {
				status: 200,
				headers: {
					"Content-Type": "text/plain",
					"Transfer-Encoding": "chunked",
				},
			});
		});

		const request = new IncomingRequest(
			`https://proxy.ferndocs.com/https://example.com/test`
		);
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);

		const reader = response.body?.getReader();
		const decoder = new TextDecoder();
		let result = "";

		const readStream = async (delay: number) => {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const { done, value } = await reader!.read();
			if (done) return result;
			result += decoder.decode(value, { stream: true });
			return new Promise((resolve) => setTimeout(() => resolve(result), delay));
		};

		const responseText50ms = await readStream(50);
		expect(responseText50ms).toBe("Hello, ");

		const responseText500ms = await readStream(500); // 500ms total delay
		expect(responseText500ms).toBe("Hello, Success!");
	});
});
