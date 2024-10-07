import { FdrAPI } from "@fern-api/fdr-sdk";
import { Generator } from "../../../api/generated/api/resources/generators";
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
    "this-is-cli-restricted",
    "python-sdk",
    "python-sdk-2",
    "python-sdk-3",
    "my-cool/example",
    "this-is-major-version-restricted",
];

beforeEach(async () => {
    // Clean slate
    await fdrApplication.dao.generators().deleteGenerators({ generatorIds: GENERATORS_FROM_OTHER_TESTS });
});

it("generator dao", async () => {
    // create snippets
    const generatorStarter: FdrAPI.generators.Generator = {
        id: FdrAPI.generators.GeneratorId("my-cool/example"),
        displayName: "My Cool Example",
        generatorType: { type: "sdk" },
        dockerImage: "my-cool/example",
        generatorLanguage: FdrAPI.generators.GeneratorLanguage.Python,
        scripts: {
            preInstallScript: {
                steps: [],
            },
            installScript: {
                steps: [],
            },
            compileScript: {
                steps: [],
            },
            testScript: {
                steps: [],
            },
        },
    };
    await fdrApplication.dao.generators().upsertGenerator({
        generator: generatorStarter,
    });

    const generator = await fdrApplication.dao
        .generators()
        .getGenerator({ generatorId: FdrAPI.generators.GeneratorId("my-cool/example") });
    expect(generator).toEqual(generatorStarter);

    await fdrApplication.dao.generators().upsertGenerator({
        generator: {
            id: FdrAPI.generators.GeneratorId("my-cool/example"),
            generatorType: { type: "sdk" },
            displayName: "My Cool Example",
            dockerImage: "changing things up",
            generatorLanguage: FdrAPI.generators.GeneratorLanguage.Typescript,
            scripts: {
                preInstallScript: {
                    steps: [],
                },
                installScript: {
                    steps: [],
                },
                compileScript: {
                    steps: [],
                },
                testScript: {
                    steps: [],
                },
            },
        },
    });
    const generatorUpdated = await fdrApplication.dao.generators().listGenerators();
    expect(generatorUpdated).length(1);
    expect(generatorUpdated[0]).toEqual({
        id: FdrAPI.generators.GeneratorId("my-cool/example"),
        generatorType: { type: "sdk" },
        displayName: "My Cool Example",
        dockerImage: "changing things up",
        generatorLanguage: FdrAPI.generators.GeneratorLanguage.Typescript,
        scripts: {
            preInstallScript: {
                steps: [],
            },
            installScript: {
                steps: [],
            },
            compileScript: {
                steps: [],
            },
            testScript: {
                steps: [],
            },
        },
    });
});

it("generator dao non-unique", async () => {
    // essentially just adding a test to make sure we don't apply a uniqueness constraint willy nilly
    await fdrApplication.dao.generators().upsertGenerator({
        generator: {
            id: FdrAPI.generators.GeneratorId("python-sdk"),
            displayName: "Python SDK",
            generatorType: { type: "sdk" },
            dockerImage: "my-cool/example",
            generatorLanguage: FdrAPI.generators.GeneratorLanguage.Python,
            scripts: {
                preInstallScript: {
                    steps: [],
                },
                installScript: {
                    steps: [],
                },
                compileScript: {
                    steps: [],
                },
                testScript: {
                    steps: [],
                },
            },
        },
    });

    await fdrApplication.dao.generators().upsertGenerator({
        generator: {
            id: FdrAPI.generators.GeneratorId("python-sdk-2"),
            displayName: "Python SDK",
            generatorType: { type: "sdk" },
            dockerImage: "my-cool/example-1",
            generatorLanguage: FdrAPI.generators.GeneratorLanguage.Python,
            scripts: {
                preInstallScript: {
                    steps: [],
                },
                installScript: {
                    steps: [],
                },
                compileScript: {
                    steps: [],
                },
                testScript: {
                    steps: [],
                },
            },
        },
    });

    await fdrApplication.dao.generators().upsertGenerator({
        generator: {
            id: FdrAPI.generators.GeneratorId("python-sdk-3"),
            displayName: "Python SDK",
            generatorType: { type: "sdk" },
            dockerImage: "my-cool/example-2",
            generatorLanguage: FdrAPI.generators.GeneratorLanguage.Python,
            scripts: {
                preInstallScript: {
                    steps: [],
                },
                installScript: {
                    steps: [],
                },
                compileScript: {
                    steps: [],
                },
                testScript: {
                    steps: [],
                },
            },
        },
    });

    const generatorUpdated = await fdrApplication.dao.generators().listGenerators();
    expect(generatorUpdated).length(3);
});

it("generator dao image non-unique", async () => {
    const generator: Generator = {
        id: FdrAPI.generators.GeneratorId("python-sdk-3"),
        displayName: "Python SDK",
        generatorType: { type: "sdk" },
        dockerImage: "my-cool/example",
        generatorLanguage: FdrAPI.generators.GeneratorLanguage.Python,
        scripts: {
            preInstallScript: {
                steps: ["here I am! a step!"],
            },
            installScript: {
                steps: [],
            },
            compileScript: {
                steps: [],
            },
            testScript: {
                steps: [],
            },
        },
    };
    await fdrApplication.dao.generators().upsertGenerator({ generator });

    await expect(async () => {
        await fdrApplication.dao.generators().upsertGenerator({
            generator: {
                id: FdrAPI.generators.GeneratorId("python-sdk-15"),
                displayName: "Python SDK",
                generatorType: { type: "sdk" },
                dockerImage: "my-cool/example",
                generatorLanguage: FdrAPI.generators.GeneratorLanguage.Python,
                scripts: {
                    preInstallScript: {
                        steps: [],
                    },
                    installScript: {
                        steps: [],
                    },
                    compileScript: {
                        steps: [],
                    },
                    testScript: {
                        steps: [],
                    },
                },
            },
        });
    }).rejects.toThrowError(
        "\nInvalid `prisma.generator.upsert()` invocation:\n\n\nUnique constraint failed on the fields: (`dockerImage`)",
    );

    const generatorByImage = await fdrApplication.dao.generators().getGeneratorByImage({ image: "my-cool/example" });

    expect(generatorByImage).toEqual(generator);
});
