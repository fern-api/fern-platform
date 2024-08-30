import cn from "clsx";
import { MonospaceText } from "../../../components/MonospaceText";
import { ResolvedEnumValue } from "../../../resolver/types";
import { ApiPageDescription } from "../../ApiPageDescription";
import { useTypeDefinitionContext } from "../context/TypeDefinitionContext";

export declare namespace EnumValue {
    export interface Props {
        enumValue: ResolvedEnumValue;
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
            <ApiPageDescription className="text-sm" description={enumValue.description} isMarkdown={true} />
        </div>
    );
};
