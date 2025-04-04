export declare namespace NavbarSectionTitle {
  export interface Props {
    title: string;
  }
}

export const NavbarSectionTitle = ({ title }: NavbarSectionTitle.Props) => {
  return (
    <div className="my-3 hidden text-xs font-bold sm:flex dark:text-gray-300">
      {title}
    </div>
  );
};
