import type { ReactElement, SVGProps } from "react";
const SvgArrowCrossed = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M10.75 1H10v1.5h2.44L1.47 13.47.94 14 2 15.06l.53-.53L13.5 3.562V6H15V2a1 1 0 0 0-1-1z"
            clipRule="evenodd"
        />
        <path
            fill="#fff"
            fillRule="evenodd"
            d="m6 7.06-.53-.53-4-4L.938 2 1.999.94l.53.53 4.001 4 .53.53zm6.438 6.44H10V15h4a1 1 0 0 0 1-1v-4h-1.5v2.44l-2.97-2.97-.53-.53L8.94 10l.53.53z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgArrowCrossed;
