import { FdrAPI } from "@fern-api/fdr-sdk";
import { createMockFdrApplication } from "../../mock";

const fdrApplication = createMockFdrApplication({
    orgIds: ["acme", "octoai"],
});

// I didn't make a delete all endpoint because that felt like a bad idea
// so we just have to clean up after ourselves with this list of used names.
const GENERATORS_FROM_OTHER_TESTS = [
    "this-fails-semver",
    "this-picks-latest",
    "this-gets-changelog",
    "this-is-the-happy-path",
    "python-sdk",
    "python-sdk-2",
    "python-sdk-3",
    "my-cool/example",
];

beforeEach(async () => {
    // Clean slate
    await fdrApplication.dao.generators().deleteGenerators({ generatorIds: GENERATORS_FROM_OTHER_TESTS });
});

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
    console.log(JSON.stringify(generatorUpdated));
    expect(generatorUpdated).length(3);
});
