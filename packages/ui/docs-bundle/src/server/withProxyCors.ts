export function withProxyCors(origin: string): HeadersInit {
    return {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
    };
}
