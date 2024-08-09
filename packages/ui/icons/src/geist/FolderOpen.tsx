import type { ReactElement, SVGProps } from "react";
const SvgFolderOpen = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M13.5 4v2h-11V2.5H6l1.333 1c.433.325.96.5 1.5.5zM1 6V1h5.167a1 1 0 0 1 .6.2l1.466 1.1a1 1 0 0 0 .6.2H15V6h1l-.167 1.5-.586 5.276A2.5 2.5 0 0 1 12.762 15H3.238a2.5 2.5 0 0 1-2.485-2.224L.167 7.5 0 6zm13 1.5H1.676l.568 5.11a1 1 0 0 0 .994.89h9.524a1 1 0 0 0 .994-.89l.568-5.11z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgFolderOpen;
