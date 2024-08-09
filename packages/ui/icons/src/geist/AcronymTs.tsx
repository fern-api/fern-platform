import type { ReactElement, SVGProps } from "react";
const SvgAcronymTs = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M0 2.5A2.5 2.5 0 0 1 2.5 0h11A2.5 2.5 0 0 1 16 2.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 0 13.5zm12.125 7a.375.375 0 0 0 0 .75 1.875 1.875 0 0 1 0 3.75H10.5v-1.5h1.625a.375.375 0 0 0 0-.75 1.875 1.875 0 0 1 0-3.75H13.5v1.5zM5 9.5h1.25V14h1.5V9.5H9V8H5z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgAcronymTs;
