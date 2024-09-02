import { APIV1Read } from "@fern-api/fdr-sdk/client/types";
import { useAtom } from "jotai";
import { useCallback } from "react";
import { CodeExample, CodeExampleGroup } from "../../../api-reference/examples/code-example";
import { FERN_LANGUAGE_ATOM } from "../../../atoms";

export function useSelectedClient(
    clients: CodeExampleGroup[],
    exampleName: string | undefined,
): [CodeExample | undefined, (nextClient: CodeExample) => void] {
    const [selectedLanguage, setSelectedLanguage] = useAtom(FERN_LANGUAGE_ATOM);
    const client = clients.find((c) => c.language === selectedLanguage) ?? clients[0];
    const selectedClient = exampleName ? client?.examples.find((e) => e.name === exampleName) : client?.examples[0];

    const handleClickClient = useCallback(
        (nextClient: CodeExample) => {
            setSelectedLanguage(nextClient.language);
        },
        [setSelectedLanguage],
    );

    return [selectedClient, handleClickClient];
}

export function extractEndpointPathAndMethod(endpoint: string): [APIV1Read.HttpMethod | undefined, string | undefined] {
    const [maybeMethod, path] = endpoint.split(" ");

    // parse method into APIV1Read.HttpMethod
    let method: APIV1Read.HttpMethod | undefined;

    if (maybeMethod != null) {
        method = maybeMethod.toUpperCase() as APIV1Read.HttpMethod;
    }

    // ensure that method is a valid HTTP method
    if (!Object.values(APIV1Read.HttpMethod).includes(method as APIV1Read.HttpMethod)) {
        return [undefined, undefined];
    }

    return [method, path];
}
