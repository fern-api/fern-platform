import classNames from "classnames";
import { PropsWithChildren } from "react";
import { InfoIcon } from "../../commons/icons/InfoIcon";

export declare namespace Info {
    export type Props = PropsWithChildren;
}

export const Info: React.FC<Info.Props> = ({ children }) => {
    return (
        <div
            className={classNames(
                "flex space-x-3 px-4 pt-4 pb-2 bg-tag-default-light dark:bg-tag-default-dark border border-border-default-light dark:border-border-default-dark rounded-lg"
            )}
        >
            <InfoIcon className="text-intent-default h-5 w-5 min-w-fit" />
            <div className="text-sm leading-6">
                <style>
                    {`
                        p {
                            font-size: inherit !important;
                            line-height: inherit !important;
                        }
                    `}
                </style>
                {children}
            </div>
        </div>
    );
};
