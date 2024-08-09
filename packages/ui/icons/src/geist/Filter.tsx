import type { ReactElement, SVGProps } from "react";
const SvgFilter = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M1 0h14v3.31l-.22.22-4.28 4.28V16H8.782l-.185-.117-2.75-1.75-.347-.221V7.81L1.22 3.53 1 3.31zm1.5 1.5v1.19l4.28 4.28.22.22v5.898l2 1.273V7.19l.22-.22 4.28-4.28V1.5z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgFilter;
