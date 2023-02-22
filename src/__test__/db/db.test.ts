import { PrismaClient } from "@prisma/client";
import { updateOrCreateApi } from "../../db/apiDao";

const testPrismaClient = new PrismaClient({
    log: ["query", "info", "warn", "error"],
});

beforeAll(async () => {
    await testPrismaClient.api.create({
        data: {
            apiId: "dummy-api",
            orgName: "dummy-org",
            clock: 0,
        },
    });
});

afterAll(async () => {
    await testPrismaClient.$disconnect();
});

it("create new draft", async () => {
    const response = updateOrCreateApi(
        {
            apiId: "dummy-api",
            orgName: "dummy-org",
        },
        testPrismaClient
    );
    expect((await response).version).toEqual("0.0.1");
});
