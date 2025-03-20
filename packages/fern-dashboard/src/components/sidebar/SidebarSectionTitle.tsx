export declare namespace SidebarSectionTitle {
  export interface Props {
    title: string;
  }
}

export const SidebarSectionTitle = ({ title }: SidebarSectionTitle.Props) => {
  return (
    <div className="text-gray-1200 my-3 text-xs font-bold dark:text-gray-300">
      {title}
    </div>
  );
};
