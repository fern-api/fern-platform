/**
 * @vitest-environment jsdom
 */

import { PathPart } from "@fern-api/fdr-sdk/api-definition";
import { EnvironmentId, PropertyKey } from "@fern-api/fdr-sdk/navigation";
import { render, screen } from "@testing-library/react";
import { EndpointUrl } from "../EndpointUrl";

function lit(value: string): PathPart.Literal {
  return { type: "literal", value };
}

function path(key: string): PathPart.PathParameter {
  return {
    type: "pathParameter",
    value: PropertyKey(key),
  };
}

describe("EndpointUrl", () => {
  it("works with lit and path", async () => {
    render(
      <EndpointUrl
        environmentId={EnvironmentId("Production")}
        baseUrl="https://api.buildwithfern.com"
        path={[lit("/testing/"), path("id")]}
        method={"GET"}
        showEnvironment={true}
      />
    );

    expect(screen.getByRole("button").textContent).toBe(
      "https://api.buildwithfern.com/testing/:id"
    );
  });

  it("renders full environment with basepath", async () => {
    render(
      <EndpointUrl
        environmentId={EnvironmentId("Production")}
        baseUrl="https://api.buildwithfern.com/with/basepath"
        path={[lit("/testing/"), path("id")]}
        method={"GET"}
        showEnvironment={true}
      />
    );

    expect(screen.getByRole("button").textContent).toBe(
      "https://api.buildwithfern.com/with/basepath/testing/:id"
    );
  });
});
