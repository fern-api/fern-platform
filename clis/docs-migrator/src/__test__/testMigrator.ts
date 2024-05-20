import path from "path";
import { MigrateFromMintlify } from "..";

export function testMigrator(fixtureName: string): void {
    // eslint-disable-next-line vitest/expect-expect
    it("crawls directory", async () => {
        const fixturePath = path.join(__dirname, "fixtures", `${fixtureName}`);
        const outputPath = path.join(__dirname, "outputs", `${fixtureName}`);

        const migrator = new MigrateFromMintlify(fixturePath, outputPath, fixtureName);
        await migrator.run();
    });
}
