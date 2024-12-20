import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll, expect, vi } from "vitest";

expect.extend(matchers);

beforeAll(() => {
    vi.mock("next/router", async () => {
        const mock = await require("next-router-mock");
        mock.Router = mock.memoryRouter;
        return mock;
    });
});

afterEach(() => {
    cleanup();
});
