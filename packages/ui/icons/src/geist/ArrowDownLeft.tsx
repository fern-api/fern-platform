import type { ReactElement, SVGProps } from "react";
const SvgArrowDownLeft = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M4.56 12.5H11V14H3a1 1 0 0 1-1-1V5h1.5v6.438l9.219-9.218.53-.53 1.06 1.06-.53.53-9.22 9.22z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgArrowDownLeft;
