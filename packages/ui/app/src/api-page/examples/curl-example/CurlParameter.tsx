import { JsonExampleString } from "../json-example/JsonExampleString";

export declare namespace CurlParameter {
    export interface Props {
        paramKey?: string;
        value?: string | JSX.Element;
        doNotStringifyValue?: boolean;
    }
}

export const CurlParameter: React.FC<CurlParameter.Props> = ({ paramKey, value, doNotStringifyValue = false }) => {
    return (
        <>
            {paramKey != null && (
                <span className="text-text-primary-light dark:text-text-primary-dark">{paramKey}</span>
            )}
            {value != null && (
                <>
                    {" "}
                    {doNotStringifyValue || typeof value !== "string" ? (
                        <span className="text-text-primary-light dark:text-text-primary-dark">{value}</span>
                    ) : (
                        <JsonExampleString value={value} />
                    )}
                </>
            )}
        </>
    );
};
