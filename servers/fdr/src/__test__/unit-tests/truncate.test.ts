import { truncateToBytes } from "../../util";

it("api register", async () => {
  const truncated = truncateToBytes(
    `Welcome to Vellum's API documentation! Here you'll find information about the various endpoints available to you, as well as the parameters and responses that they accept and return.

    We will be exposing more and more of our APIs over time as they stabilize. If there is some action you can perform via the UI that you wish you could perform via API, please let us know and we can expose it here in an unstable state.
    
    API Stability
    Some of the APIs documented within are undergoing active development. Use the Beta and GA tags to differentiate between those that are stable and those that are not. GA stands for generally available.
    
    Base URLs
    Some endpoints are hosted separately from the main Vellum API and therefore have a different base url. If this is the case, they will say so in their description.
    
    Unless otherwise specified, all endpoints use https://api.vellum.ai as their base URL.`,
    100
  );
  console.log(truncated);
  expect(truncated.length).toEqual(100);
});
