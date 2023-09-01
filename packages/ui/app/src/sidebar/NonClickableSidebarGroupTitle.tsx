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
                        "font-extrabold tracking-wide leading-4 py-2 px-3 text-xs",
                        "text-text-primary-light dark:text-text-primary-dark"
                    )}
                >
                    {title}
                </div>
            }
        />
    );
};
