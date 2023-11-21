import React, { ReactElement } from "react";
import { SeparatedElements } from "../../../commons/SeparatedElements";
import { TypeComponentSeparator } from "../TypeComponentSeparator";

export declare namespace TypeDefinitionDetails {
    export interface Props {
        elements: ReactElement[];
        separatorText: string | undefined;
    }
}

export const TypeDefinitionDetails: React.FC<TypeDefinitionDetails.Props> = ({ elements, separatorText }) => {
    return (
        <div className="flex flex-col">
            <SeparatedElements
                separator={
                    separatorText != null ? (
                        <div className="flex h-px items-center gap-2">
                            <TypeComponentSeparator className="flex-1" />
                            <div className="t-muted">{separatorText}</div>
                            <TypeComponentSeparator className="flex-1" />
                        </div>
                    ) : (
                        <TypeComponentSeparator />
                    )
                }
            >
                {elements}
            </SeparatedElements>
        </div>
    );
};
