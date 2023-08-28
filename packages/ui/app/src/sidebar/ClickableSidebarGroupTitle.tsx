import classNames from "classnames";
import { HiOutlineChevronDown } from "react-icons/hi2";
import { SidebarItemLayout } from "./SidebarItemLayout";

export declare namespace ClickableSidebarGroupTitle {
    export interface Props {
        title: string;
        onClick: React.MouseEventHandler<HTMLButtonElement>;
        collapsed: boolean;
    }
}

export const ClickableSidebarGroupTitle: React.FC<ClickableSidebarGroupTitle.Props> = ({
    onClick,
    title,
    collapsed,
}) => {
    return (
        <button onClick={onClick} className="group/sb-group-container">
            <SidebarItemLayout
                title={
                    <div
                        className={classNames(
                            "text-text-primary-light py-2 pl-4 dark:text-text-primary-dark group-hover/sb-group-container:text-accent-primary transition-colors font-normal w-full flex justify-between items-center"
                        )}
                    >
                        <span className="text-xs font-extrabold leading-4 tracking-wide">{title}</span>
                        <HiOutlineChevronDown
                            className={classNames("text-sm transition-all", {
                                "-rotate-90": collapsed,
                                "rotate-0": !collapsed,
                            })}
                        />
                    </div>
                }
            />
        </button>
    );
};
