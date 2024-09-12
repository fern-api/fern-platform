export function getGeneratorNameFromImageName(generatorName: string): string {
    if (generatorName.startsWith("fernapi/")) {
        generatorName = generatorName.replace("fernapi/", "");
    }
    switch (generatorName) {
        // Python
        case "fern-python-sdk":
            return "python-sdk";
        case "fern-pydantic-model":
            return "pydantic";
        case "fern-fastapi-server":
            return "fastapi";
        // TypeScript
        case "fern-typescript-browser-sdk":
        case "fern-typescript-node-sdk":
        case "fern-typescript-sdk":
            return "ts-sdk";
        case "fern-typescript-express":
            return "ts-express";
        // Java
        case "fern-java-sdk":
            return "java-sdk";
        case "java-model":
            return "java-model";
        case "fern-java-spring":
            return "java-spring";
        // Go
        case "fern-go-sdk":
            return "go-sdk";
        case "fern-go-model":
            return "go-model";
        case "fern-go-fiber":
            return "go-fiber";
        // C#
        case "fern-csharp-sdk":
            return "csharp-sdk";
        case "fern-csharp-model":
            return "csharp-model";
        // Ruby
        case "fern-ruby-sdk":
            return "ruby-sdk";
        case "fern-ruby-model":
            return "ruby-model";
        // Misc.
        case "fern-postman":
            return "postman";
        case "fern-openapi":
            return "openapi";

        default: {
            console.log(`Unrecognized generator name found, attempting to parse manually: ${generatorName}`);
            if (generatorName.startsWith("fern-")) {
                return generatorName.replace("fern-", "");
            }
            return generatorName;
        }
    }
}
