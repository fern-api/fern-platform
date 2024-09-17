export async function safeCommand(fn: () => Promise<void>): Promise<void> {
    try {
        await fn();
        process.exit(0);
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        process.exit(1);
    }
}
