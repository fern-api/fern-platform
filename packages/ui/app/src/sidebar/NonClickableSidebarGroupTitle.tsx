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
                <h6 className="text-text-primary-light dark:text-text-primary-dark mt-0 px-3 py-2 leading-4 tracking-wide">
                    {title}
                </h6>
            }
        />
    );
};
