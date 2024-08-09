import type { ReactElement, SVGProps } from "react";
const SvgRefreshCounterClockwise = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M2.729 6.425a5.503 5.503 0 0 1 10.112-1.04l.357.66 1.319-.714-.357-.66a7.002 7.002 0 0 0-12.658.723V3h-1.5v4.175c0 .414.335.75.75.75h4.173v-1.5zm10.542 3.15h-2.197v-1.5h4.175a.75.75 0 0 1 .75.75V13h-1.5v-2.395a7.002 7.002 0 0 1-12.64.755l-.361-.657 1.315-.721.36.658a5.503 5.503 0 0 0 10.098-1.064z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgRefreshCounterClockwise;
