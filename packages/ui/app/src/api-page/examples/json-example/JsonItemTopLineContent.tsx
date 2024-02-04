import { size } from "lodash-es";
import { ReactElement, useMemo } from "react";
import { JsonExampleString } from "./JsonExampleString";
import { visitJsonItem } from "./visitJsonItem";

export declare namespace JsonItemTopLineContent {
    export interface Props {
        value: unknown;
        isNonLastItemInCollection: boolean;
    }
}

export const JsonItemTopLineContent: React.FC<JsonItemTopLineContent.Props> = ({
    value,
    isNonLastItemInCollection,
}) => {
    const { content, isEndOfElement } = useMemo(
        (): { content: ReactElement; isEndOfElement: boolean } =>
            visitJsonItem(value, {
                object: (object) =>
                    size(object) > 0
                        ? {
                              content: (
                                  <span className="text-text-default-light dark:text-text-default-dark">{"{"}</span>
                              ),
                              isEndOfElement: false,
                          }
                        : {
                              content: (
                                  <span className="text-text-default-light dark:text-text-default-dark">{"{}"}</span>
                              ),
                              isEndOfElement: true,
                          },
                list: (list) =>
                    list.length > 0
                        ? {
                              content: (
                                  <span className="text-text-default-light dark:text-text-default-dark">{"["}</span>
                              ),
                              isEndOfElement: false,
                          }
                        : {
                              content: (
                                  <span className="text-text-default-light dark:text-text-default-dark">{"[]"}</span>
                              ),
                              isEndOfElement: true,
                          },
                string: (value) => ({
                    content: <JsonExampleString value={value} />,
                    isEndOfElement: true,
                }),
                number: (value) => ({ content: <span className="text-[#d67653]">{value}</span>, isEndOfElement: true }),
                boolean: (value) => ({
                    content: <span className="font-medium text-[#738ee8]">{value.toString()}</span>,
                    isEndOfElement: true,
                }),
                null: () => ({ content: <span>null</span>, isEndOfElement: true }),
            }),
        [value],
    );

    return (
        <span className="whitespace-nowrap">
            {content}
            {isNonLastItemInCollection && isEndOfElement && (
                <span className="text-text-default-light dark:text-text-default-dark">,</span>
            )}
        </span>
    );
};
