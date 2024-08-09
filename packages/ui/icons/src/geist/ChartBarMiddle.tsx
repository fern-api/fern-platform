import type { ReactElement, SVGProps } from "react";
const SvgChartBarMiddle = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M8.75 1v14h-1.5V1zM3.5 9v6H2V9zM14 6.75V6h-1.5v9H14z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgChartBarMiddle;
