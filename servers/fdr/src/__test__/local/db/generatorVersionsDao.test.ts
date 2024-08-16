import { FdrAPI } from "@fern-api/fdr-sdk";
import { createMockFdrApplication } from "../../mock";

const fdrApplication = createMockFdrApplication({
    orgIds: ["acme", "octoai"],
});

// Bad version on create throws
// Insert multiple and return the right latest (insert out of order)
// Get changelog
// Update version
// Ensure overwrites
it("generator dao", async () => {
    // create snippets
    const generatorStarter: FdrAPI.generators.Generator = {
        id: "my-cool/example",
        generator_type: { type: "sdk" },
        docker_image: "my-cool/example",
        generator_language: FdrAPI.generators.GeneratorLanguage.Python,
    };
    await fdrApplication.dao.generators().upsertGenerator({
        generator: generatorStarter,
    });

    const generator = await fdrApplication.dao.generators().getGenerator({ generatorId: "my-cool/example" });
    expect(generator).toEqual(generatorStarter);

    await fdrApplication.dao.generators().upsertGenerator({
        generator: {
            id: "my-cool/example",
            generator_type: { type: "sdk" },
            docker_image: "changing things up",
            generator_language: FdrAPI.generators.GeneratorLanguage.Typescript,
        },
    });
    const generatorUpdated = await fdrApplication.dao.generators().listGenerators();
    expect(generatorUpdated).length(1);
    expect(generatorUpdated[0]).toEqual({
        id: "my-cool/example",
        generator_type: { type: "sdk" },
        docker_image: "changing things up",
        generator_language: FdrAPI.generators.GeneratorLanguage.Typescript,
    });

    // test clean up
    await fdrApplication.dao.generators().deleteGenerator({ generatorId: "my-cool/example" });
});

it("generator dao non-unique", async () => {
    // essentially just adding a test to make sure we don't apply a uniqueness constraint willy nilly
    await fdrApplication.dao.generators().upsertGenerator({
        generator: {
            id: "python-sdk",
            generator_type: { type: "sdk" },
            docker_image: "my-cool/example",
            generator_language: FdrAPI.generators.GeneratorLanguage.Python,
        },
    });

    await fdrApplication.dao.generators().upsertGenerator({
        generator: {
            id: "python-sdk-2",
            generator_type: { type: "sdk" },
            docker_image: "my-cool/example",
            generator_language: FdrAPI.generators.GeneratorLanguage.Python,
        },
    });

    await fdrApplication.dao.generators().upsertGenerator({
        generator: {
            id: "python-sdk-3",
            generator_type: { type: "sdk" },
            docker_image: "my-cool/example",
            generator_language: FdrAPI.generators.GeneratorLanguage.Python,
        },
    });

    const generatorUpdated = await fdrApplication.dao.generators().listGenerators();
    expect(generatorUpdated).length(3);

    // test clean up
    await fdrApplication.dao
        .generators()
        .deleteGenerators({ generatorIds: ["python-sdk", "python-sdk-2", "python-sdk-3"] });
});
