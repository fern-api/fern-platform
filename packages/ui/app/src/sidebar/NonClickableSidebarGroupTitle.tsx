import classNames from "classnames";
import { SidebarItemLayout } from "./SidebarItemLayout";

export declare namespace NonClickableSidebarGroupTitle {
    export interface Props {
        title: string;
    }
}

export const NonClickableSidebarGroupTitle: React.FC<NonClickableSidebarGroupTitle.Props> = ({ title }) => {
    return (
        <SidebarItemLayout
            title={
                <div
                    className={classNames(
                        "uppercase font-normal tracking-wide text-xs",
                        "text-text-primary-light dark:text-text-primary-dark"
                    )}
                >
                    {title}
                </div>
            }
        />
    );
};
