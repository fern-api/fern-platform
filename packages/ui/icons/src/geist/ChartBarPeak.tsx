import type { ReactElement, SVGProps } from "react";
const SvgChartBarPeak = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M14 1v14h-1.5V1zM8.75 6v9h-1.5V6zM3.5 10.75V10H2v5h1.5z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgChartBarPeak;
