import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import { unwrapReference } from "@fern-api/fdr-sdk/api-definition";
import { ReactElement, useMemo } from "react";
import { PlaygroundObjectForm } from "../form/PlaygroundObjectForm";
import { PlaygroundTypeReferenceForm } from "../form/PlaygroundTypeReferenceForm";
import { PlaygroundEndpointFormSection } from "./PlaygroundEndpointFormSection";

interface PlaygroundEndpointAliasFormProps {
    alias: ApiDefinition.HttpRequestBodyShape.Alias;
    types: Record<ApiDefinition.TypeId, ApiDefinition.TypeDefinition>;
    ignoreHeaders: boolean;
    setBodyJson: (value: unknown) => void;
    value: unknown;
}

export function PlaygroundEndpointAliasForm({
    alias,
    types,
    ignoreHeaders,
    setBodyJson,
    value,
}: PlaygroundEndpointAliasFormProps): ReactElement {
    const { shape, isOptional } = useMemo(
        () => unwrapReference(alias.value, types),
        [alias.value, types]
    );

    if (shape.type === "object" && !isOptional) {
        return (
            <PlaygroundEndpointFormSection
                ignoreHeaders={ignoreHeaders}
                title="Body Parameters"
            >
                <PlaygroundObjectForm
                    id="body"
                    shape={shape}
                    onChange={setBodyJson}
                    value={value}
                    types={types}
                />
            </PlaygroundEndpointFormSection>
        );
    }
    return (
        <PlaygroundEndpointFormSection
            ignoreHeaders={ignoreHeaders}
            title={isOptional ? "Optional Body" : "Body"}
        >
            <PlaygroundTypeReferenceForm
                id="body"
                shape={shape}
                onChange={setBodyJson}
                value={value}
                types={types}
            />
        </PlaygroundEndpointFormSection>
    );
}
