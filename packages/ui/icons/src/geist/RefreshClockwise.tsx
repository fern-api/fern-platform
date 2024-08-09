import type { ReactElement, SVGProps } from "react";
const SvgRefreshClockwise = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M8 1.25a7 7 0 0 0-6.16 3.672l-.357.66 1.32.713.357-.66a5.503 5.503 0 0 1 10.112 1.039h-2.198v1.5h4.175a.75.75 0 0 0 .75-.75V3.25h-1.5v2.395A7 7 0 0 0 8 1.25m-6.499 9.605v2.395h-1.5V9.075a.75.75 0 0 1 .75-.75h4.175v1.5H2.729a5.503 5.503 0 0 0 10.098 1.065l.36-.658 1.316.72-.361.659a7.002 7.002 0 0 1-12.64-.755z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgRefreshClockwise;
