export function sleep(duration: number): Promise<void> {
    return new Promise<void>((res) => setTimeout(res, duration));
}
