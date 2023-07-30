import React from "react";
import { TypeComponentSeparator } from "../types/TypeComponentSeparator";
import { EndpointParameter } from "./EndpointParameter";
import { EndpointSection } from "./EndpointSection";

export declare namespace EndpointParametersSection {
    export interface Props {
        title: string;
        parameters: EndpointParameter.Props[];
        anchor: string;
    }
}

export const EndpointParametersSection: React.FC<EndpointParametersSection.Props> = ({ title, parameters, anchor }) => {
    return (
        <EndpointSection title={title} anchor={anchor}>
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
