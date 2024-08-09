import type { ReactElement, SVGProps } from "react";
const SvgChevronCircleUp = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M14.5 8a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m3.28-7.53L8.7 5.89a.99.99 0 0 0-1.4 0L4.72 8.47 4.19 9l1.06 1.06.53-.53L8 7.31l2.22 2.22.53.53L11.81 9z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgChevronCircleUp;
