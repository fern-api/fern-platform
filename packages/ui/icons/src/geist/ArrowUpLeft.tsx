import type { ReactElement, SVGProps } from "react";
const SvgArrowUpLeft = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M2 10.25V11h1.5V4.56l9.22 9.22.53.53 1.06-1.06-.53-.53L4.56 3.5H11V2H3a1 1 0 0 0-1 1z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgArrowUpLeft;
