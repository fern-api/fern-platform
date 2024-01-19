import { APIV1Read } from "@fern-api/fdr-sdk";
import classNames from "classnames";
import { MonospaceText } from "../../../commons/monospace/MonospaceText";
import { ApiPageDescription } from "../../ApiPageDescription";
import { useTypeDefinitionContext } from "../context/TypeDefinitionContext";

export declare namespace EnumValue {
    export interface Props {
        enumValue: APIV1Read.EnumValue;
    }
}

export const EnumValue: React.FC<EnumValue.Props> = ({ enumValue }) => {
    const { isRootTypeDefinition } = useTypeDefinitionContext();

    return (
        <div
            className={classNames("flex flex-col gap-2 py-2", {
                "px-2": !isRootTypeDefinition,
            })}
        >
            <MonospaceText className="text-text-primary-light dark:text-text-primary-dark text-sm">{`"${enumValue.value}"`}</MonospaceText>
            <ApiPageDescription className="text-sm" description={enumValue.description} isMarkdown={true} />
        </div>
    );
};
