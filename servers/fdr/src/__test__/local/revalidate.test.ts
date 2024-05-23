import { RevalidatorServiceImpl } from "../../services/revalidator/RevalidatorService";
import { ParsedBaseUrl } from "../../util/ParsedBaseUrl";

it.skip("revalidates a custom docs domain", async () => {
    const revalidationService = new RevalidatorServiceImpl();

    const revalidationResult = await revalidationService.revalidate({
        baseUrl: ParsedBaseUrl.parse("https://fdr-ete-test.buildwithfern.com"),
    });

    expect(revalidationResult.revalidationFailed).toEqual(false);

    expect(revalidationResult.response?.failedRevalidations.length).toEqual(0);

    expect(revalidationResult.response?.successfulRevalidations.length).toBeGreaterThan(0);
});
