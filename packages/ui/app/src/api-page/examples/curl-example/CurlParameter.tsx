import { JsonExampleString } from "../json-example/JsonExampleString";

export declare namespace CurlParameter {
    export interface Props {
        paramKey: string;
        value?: string;
        doNotStringifyValue?: boolean;
    }
}

export const CurlParameter: React.FC<CurlParameter.Props> = ({ paramKey, value, doNotStringifyValue = false }) => {
    return (
        <>
            <span className="text-text-muted-light dark:text-text-muted-dark">{paramKey}</span>
            {value != null && (
                <>
                    {" "}
                    {doNotStringifyValue ? (
                        <span className="text-text-muted-light dark:text-text-muted-dark">{value}</span>
                    ) : (
                        <JsonExampleString value={value} />
                    )}
                </>
            )}
        </>
    );
};
