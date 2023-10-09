import React from "react";
import { TypeComponentSeparator } from "../types/TypeComponentSeparator";
import { EndpointParameter } from "./EndpointParameter";
import { EndpointSection } from "./EndpointSection";

export declare namespace EndpointParametersSection {
    export interface Props {
        title: string;
        parameters: EndpointParameter.Props[];
        anchorIdParts: string[];
        route: string;
    }
}

export const EndpointParametersSection: React.FC<EndpointParametersSection.Props> = ({
    title,
    parameters,
    anchorIdParts,
    route,
}) => {
    return (
        <EndpointSection title={title} anchorIdParts={anchorIdParts} route={route}>
            <div className="flex flex-col">
                {parameters.map((parameter, index) => (
                    <div className="flex flex-col" key={index}>
                        <TypeComponentSeparator />
                        <EndpointParameter {...parameter} />
                    </div>
                ))}
            </div>
        </EndpointSection>
    );
};
