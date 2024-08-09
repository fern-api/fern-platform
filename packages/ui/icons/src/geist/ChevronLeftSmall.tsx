import type { ReactElement, SVGProps } from "react";
const SvgChevronLeftSmall = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="m9.25 12.06-.53-.53-2.824-2.823a1 1 0 0 1 0-1.414L8.72 4.47l.53-.53L10.31 5l-.53.53L7.31 8l2.47 2.47.53.53z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgChevronLeftSmall;
