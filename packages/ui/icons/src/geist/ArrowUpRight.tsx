import type { ReactElement, SVGProps } from "react";
const SvgArrowUpRight = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M5.75 2H5v1.5h6.44l-9.22 9.22-.53.53 1.06 1.06.53-.53 9.22-9.218V11H14V3a1 1 0 0 0-1-1z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgArrowUpRight;
