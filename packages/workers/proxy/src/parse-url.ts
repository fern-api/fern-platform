export function parseUrl(url: string): URL | undefined {
	const originalUrl = new URL(url);

	const forwardedUrl = new URL(
		originalUrl.pathname.slice(1).replace(/^(https|wss):\/(?!\/)/, "$1://"),
		"https://n"
	);

	if (
		forwardedUrl.host === "n" ||
		!["https:", "wss:"].includes(forwardedUrl.protocol)
	) {
		return undefined;
	}

	// copy over the search params
	originalUrl.searchParams.forEach((value, key) => {
		forwardedUrl.searchParams.set(key, value);
	});

	return forwardedUrl;
}
