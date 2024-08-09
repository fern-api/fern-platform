import type { ReactElement, SVGProps } from "react";
const SvgChartActivity = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="m5.513 3.624-1.75 4.723A1 1 0 0 1 2.827 9H0V7.5h2.478l2.089-5.64c.32-.864 1.54-.872 1.87-.011l4.077 10.597L12.24 8.13a1 1 0 0 1 .928-.629H16V9h-2.492l-2.075 5.187c-.338.844-1.535.836-1.862-.013z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgChartActivity;
