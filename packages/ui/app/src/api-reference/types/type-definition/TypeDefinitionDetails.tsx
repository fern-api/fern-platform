import React, { ReactElement } from "react";
import { SeparatedElements } from "../../../components/SeparatedElements";
import { TypeComponentSeparator } from "../TypeComponentSeparator";

export declare namespace TypeDefinitionDetails {
    export interface Props {
        elements: ReactElement[];
        separatorText: string | undefined;
    }
}

export const TypeDefinitionDetails: React.FC<TypeDefinitionDetails.Props> = ({ elements, separatorText }) => {
    return (
        <SeparatedElements
            separator={
                separatorText != null ? (
                    <div className="flex h-px items-center gap-2">
                        <TypeComponentSeparator className="flex-1" />
                        <div className="t-muted text-sm">{separatorText}</div>
                        <TypeComponentSeparator className="flex-1" />
                    </div>
                ) : (
                    <TypeComponentSeparator />
                )
            }
        >
            {elements}
        </SeparatedElements>
    );
};
