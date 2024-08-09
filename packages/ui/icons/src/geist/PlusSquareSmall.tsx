import type { ReactElement, SVGProps } from "react";
const SvgPlusSquareSmall = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M5 4.25h6a.75.75 0 0 1 .75.75v6a.75.75 0 0 1-.75.75H5a.75.75 0 0 1-.75-.75V5A.75.75 0 0 1 5 4.25M3 5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zm4.375 5.375v-1.75h-1.75v-1.25h1.75v-1.75h1.25v1.75h1.75v1.25h-1.75v1.75z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgPlusSquareSmall;
