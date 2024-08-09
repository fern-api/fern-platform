import type { ReactElement, SVGProps } from "react";
const SvgChevronCircleLeftFill = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m.47-4.72.53.53 1.06-1.06-.53-.53L7.31 8l2.22-2.22.53-.53L9 4.19l-.53.53-2.574 2.573a1 1 0 0 0 0 1.414z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgChevronCircleLeftFill;
