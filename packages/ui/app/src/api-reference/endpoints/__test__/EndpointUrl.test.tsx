/**
 * @vitest-environment jsdom
 */

import type * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import { render, screen } from "@testing-library/react";
import { EndpointUrl } from "../EndpointUrl";

function lit(value: string): ApiDefinition.EndpointPathPart {
    return { type: "literal", value };
}

function path(key: string): ApiDefinition.EndpointPathPart {
    return {
        type: "pathParameter",
        value: key,
    };
}

describe("EndpointUrl", () => {
    it("works with lit and path", async () => {
        render(
            <EndpointUrl
                selectedEnvironment={{
                    id: "Production",
                    baseUrl: "https://api.buildwithfern.com",
                }}
                path={[lit("/testing/"), path("id")]}
                method={"GET"}
                showEnvironment={true}
            />,
        );

        expect(screen.getByRole("button").textContent).toBe("https://api.buildwithfern.com/testing/:id");
    });

    it("renders full environment with basepath", async () => {
        render(
            <EndpointUrl
                selectedEnvironment={{
                    id: "Production",
                    baseUrl: "https://api.buildwithfern.com/with/basepath",
                }}
                path={[lit("/testing/"), path("id")]}
                method={"GET"}
                showEnvironment={true}
            />,
        );

        expect(screen.getByRole("button").textContent).toBe("https://api.buildwithfern.com/with/basepath/testing/:id");
    });
});
