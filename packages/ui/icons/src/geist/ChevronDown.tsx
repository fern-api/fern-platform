import type { ReactElement, SVGProps } from "react";
const SvgChevronDown = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="m14.06 5.5-.53.53-4.823 4.824a1 1 0 0 1-1.414 0L2.47 6.03l-.53-.53L3 4.44l.53.53L8 9.44l4.47-4.47.53-.53z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgChevronDown;
