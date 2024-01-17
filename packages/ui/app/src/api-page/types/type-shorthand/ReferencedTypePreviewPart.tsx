import { APIV1Read } from "@fern-api/fdr-sdk";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import React, { ReactElement } from "react";
import { useApiDefinitionContext } from "../../../api-context/useApiDefinitionContext";
import { TypeShorthand } from "./TypeShorthand";

export declare namespace ReferencedTypePreviewPart {
    export interface Props {
        typeId: APIV1Read.TypeId;
        plural: boolean;
        withArticle?: boolean;
        resolveTypeById?: (id: string) => APIV1Read.TypeDefinition | undefined;
    }
}

interface TypeShapeShorthandProps {
    shape: APIV1Read.TypeShape;
    plural: boolean;
    withArticle?: boolean;
}

export const TypeShapeShorthand: React.FC<TypeShapeShorthandProps> = ({ shape, plural, withArticle }) => {
    const maybeWithArticle = (article: string, stringWithoutArticle: string) =>
        withArticle ? `${article} ${stringWithoutArticle}` : stringWithoutArticle;

    return (
        <>
            {visitDiscriminatedUnion(shape, "type")._visit<ReactElement | string>({
                alias: (typeReference) => (
                    <TypeShorthand type={typeReference.value} plural={plural} withArticle={withArticle} />
                ),
                object: () => (plural ? "objects" : maybeWithArticle("an", "object")),
                undiscriminatedUnion: () => (plural ? "unions" : maybeWithArticle("a", "union")),
                discriminatedUnion: () => (plural ? "unions" : maybeWithArticle("a", "union")),
                enum: () => (plural ? "enums" : maybeWithArticle("an", "enum")),
                _other: () => "<unknown>",
            })}
        </>
    );
};

export function renderReferencedTypePreviewPart(
    typeId: APIV1Read.TypeId,
    plural: boolean,
    withArticle: boolean,
    resolveTypeById: (id: string) => APIV1Read.TypeDefinition | undefined
): ReactElement {
    const shape = resolveTypeById(typeId)?.shape;

    if (shape == null) {
        return <>{"<unknown>"}</>;
    }

    return <TypeShapeShorthand shape={shape} plural={plural} withArticle={withArticle} />;
}

export const ReferencedTypePreviewPart: React.FC<ReferencedTypePreviewPart.Props> = ({
    typeId,
    plural,
    withArticle = false,
    resolveTypeById: resolveTypeByIdParent,
}) => {
    const { resolveTypeById: contextResolveTypeById } = useApiDefinitionContext();

    const resolveTypeById = resolveTypeByIdParent ?? contextResolveTypeById;
    return renderReferencedTypePreviewPart(typeId, plural, withArticle, resolveTypeById);
};
