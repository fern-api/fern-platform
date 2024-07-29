import { ApiAuth } from "../../../../../fdr-sdk/src/client/generated/api/resources/api/resources/v1/resources/read";

export declare namespace EndpointAuthSection {
    export interface Props {
        auth: ApiAuth;
    }
}

export const EndpointAuthSection: React.FC<EndpointAuthSection.Props> = ({ auth }) => {
    return (
        <div className="scroll-mt-content-padded fern-api-property">
            <div className="fern-api-property-header">
                <span className="fern-api-property-key">{auth.tokenName}</span>
                <span className="fern-api-property-meta">
                    {auth.type}
                    <span className="t-danger">Required</span>
                </span>
            </div>
        </div>
    );
};
