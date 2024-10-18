import { openapiAtom, store } from "../../atoms";
import { CommandProps } from "../types";

export const options: Record<string, string> = {
    vercel: "https://openapi.vercel.sh/",
    square: "https://raw.githubusercontent.com/square/connect-api-specification/refs/heads/master/api.json",
    petstore: "https://petstore3.swagger.io/api/v3/openapi.json",
    webflow: "https://docs.developers.webflow.com/data/openapi/63e26ca9751bf5002ee143f2",
};

export const callInstall = async (props: CommandProps, key?: string) => {
    if (!key) {
        props.stderr.write("Available APIs:\n");
        props.stdout.write(Object.keys(options).join("\n") + "\n");
        return 0;
    }

    const url = options[key];

    if (!url) {
        props.stderr.write(`Unknown API: ${key}\n`);
        return 1;
    }

    try {
        const openapi = await fetch(url).then((res) => res.json());

        store.set(openapiAtom, (records) => ({ ...records, [key]: openapi }));

        props.stdout.write(`Successfully installed "${key}"\n`);

        return 0;
    } catch (err) {
        props.stderr.write(`Failed to install "${key}": ${err}\n`);
        return 1;
    }
};
