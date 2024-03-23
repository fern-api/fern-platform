import axios from "axios";
import { RevalidatorServiceImpl } from "../../services/revalidator/RevalidatorService";
import { ParsedBaseUrl } from "../../util/ParsedBaseUrl";

const PORT = 8080;

// We don't spin up the server in this test.
// eslint-disable-next-line jest/no-disabled-tests
it.skip("definition register", async () => {
    // register empty definition
    const healthResponse = await axios.get(`http://localhost:${PORT}/health`);
    expect(healthResponse.status).toEqual(200);
});

it("revalidates a custom docs domain", async () => {
    const revalidationService = new RevalidatorServiceImpl();

    const revalidationResult = await revalidationService.revalidate({
        baseUrl: ParsedBaseUrl.parse("https://fdr-ete-test.buildwithfern.com"),
        fernUrl: ParsedBaseUrl.parse("https://fdr-ete-test.buildwithfern.com"),
    });

    expect(revalidationResult.revalidationFailed).toEqual(false);

    expect(revalidationResult.failedRevalidations.length).toEqual(0);

    expect(revalidationResult.successfulRevalidations.length).toBeGreaterThan(0);
});
