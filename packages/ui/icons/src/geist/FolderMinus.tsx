import type { ReactElement, SVGProps } from "react";
const SvgFolderMinus = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M14.5 4v8.5a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-10H6l1.333 1c.433.325.96.5 1.5.5zM0 1h6.167a1 1 0 0 1 .6.2l1.466 1.1a1 1 0 0 0 .6.2H16v10a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 0 12.5zm5.75 7H5v1.5h6V8z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgFolderMinus;
