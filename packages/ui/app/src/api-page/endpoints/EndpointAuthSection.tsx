import { ApiAuth } from "../../../../../fdr-sdk/src/client/generated/api/resources/api/resources/v1/resources/read";
import { TypeComponentSeparator } from "../types/TypeComponentSeparator";

export declare namespace EndpointAuthSection {
    export interface Props {
        auth: ApiAuth;
    }
}

export const EndpointAuthSection: React.FC<EndpointAuthSection.Props> = ({ auth }) => {
    console.log(auth);
    return (
        <div className="flex flex-col">
            <TypeComponentSeparator />
            <div className="scroll-mt-content-padded fern-api-property">
                <div className="fern-api-property-header">
                    <span className="fern-api-property-key">Type</span>
                    <span className="fern-api-property-meta">headerAuth</span>
                </div>
                <TypeComponentSeparator />
                {auth.type === "bearerAuth" && (
                    <div className="fern-api-property-header">
                        <span className="fern-api-property-key">Token</span>
                        <span className="fern-api-property-meta">string</span>
                    </div>
                )}
                {auth.type === "basicAuth" && (
                    <>
                        <div className="fern-api-property-header">
                            <span className="fern-api-property-key">Username</span>
                            <span className="fern-api-property-meta">string</span>
                        </div>
                        <TypeComponentSeparator />
                        <div className="fern-api-property-header">
                            <span className="fern-api-property-key">Password</span>
                            <span className="fern-api-property-meta">string</span>
                        </div>
                    </>
                )}
                {auth.type === "header" && (
                    <>
                        <div className="fern-api-property-header">
                            <span className="fern-api-property-key">Name override</span>
                            <span className="fern-api-property-meta">string</span>
                        </div>
                        <TypeComponentSeparator />
                        <div className="fern-api-property-header">
                            <span className="fern-api-property-key">Header wire</span>
                            <span className="fern-api-property-meta">string</span>
                        </div>
                        <TypeComponentSeparator />
                        <div className="fern-api-property-header">
                            <span className="fern-api-property-key">Prefix</span>
                            <span className="fern-api-property-meta">string</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
