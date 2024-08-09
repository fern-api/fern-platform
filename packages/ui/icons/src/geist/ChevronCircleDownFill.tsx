import type { ReactElement, SVGProps } from "react";
const SvgChevronCircleDownFill = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m3.28-8.47.53-.53-1.06-1.06-.53.53L8 8.69 5.78 6.47l-.53-.53L4.19 7l.53.53 2.573 2.574a1 1 0 0 0 1.414 0z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgChevronCircleDownFill;
