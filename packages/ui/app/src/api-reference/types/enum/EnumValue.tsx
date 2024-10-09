import type * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import cn from "clsx";
import { MonospaceText } from "../../../components/MonospaceText";
import { Markdown } from "../../../mdx/Markdown";
import { useTypeDefinitionContext } from "../context/TypeDefinitionContext";

export declare namespace EnumValue {
    export interface Props {
        enumValue: ApiDefinition.EnumValue;
    }
}

export const EnumValue: React.FC<EnumValue.Props> = ({ enumValue }) => {
    const { isRootTypeDefinition } = useTypeDefinitionContext();

    return (
        <div
            className={cn("flex flex-col gap-2 py-2", {
                "px-2": !isRootTypeDefinition,
            })}
        >
            <MonospaceText className="t-default text-sm">{`"${enumValue.value}"`}</MonospaceText>
            <Markdown size="sm" mdx={enumValue.description} />
        </div>
    );
};
