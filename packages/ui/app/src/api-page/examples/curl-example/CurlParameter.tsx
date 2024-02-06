import { JsonExampleString } from "../json-example/JsonExampleString";
import { renderJsonLine } from "../json-example/jsonLineUtils";
import { CurlParamValues } from "./curlUtils";

export declare namespace CurlParameter {
    export interface Props {
        paramKey?: string;
        value?: string | CurlParamValues[];
        doNotStringifyValue?: boolean;
    }
}

export const CurlParameter: React.FC<CurlParameter.Props> = ({ paramKey, value, doNotStringifyValue = false }) => {
    return (
        <>
            {paramKey != null && (
                <span className="text-text-default-light dark:text-text-default-dark">{paramKey}</span>
            )}
            {value != null && (
                <>
                    {" "}
                    {doNotStringifyValue || typeof value !== "string" ? (
                        <span className="text-text-default-light dark:text-text-default-dark">
                            {typeof value === "string"
                                ? value
                                : value.map((v, i) =>
                                      v.type === "symbol" ? (
                                          <JsonExampleString key={i} value={v.value} doNotStringify />
                                      ) : (
                                          <span className="text-text-default-light dark:text-text-default-dark" key={i}>
                                              {renderJsonLine(v.value)}
                                          </span>
                                      ),
                                  )}
                        </span>
                    ) : (
                        <JsonExampleString value={value} />
                    )}
                </>
            )}
        </>
    );
};
