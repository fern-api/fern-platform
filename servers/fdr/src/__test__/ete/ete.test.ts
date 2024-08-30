const PORT = 8080;

it("check health", async () => {
    // register empty definition
    const response = await fetch(`http://localhost:${PORT}/health`);
    expect(response.status).toEqual(200);
}, 100_000);

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
