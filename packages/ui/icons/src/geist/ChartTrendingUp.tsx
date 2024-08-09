import type { ReactElement, SVGProps } from "react";
const SvgChartTrendingUp = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M10.824 3h-.75v1.5h3.364L8.5 9.438 6.207 7.146a1 1 0 0 0-1.414 0L.72 11.22l-.53.53 1.06 1.06.53-.53L5.5 8.56l2.293 2.293a1 1 0 0 0 1.414 0L14.5 5.56v3.364H16V4a1 1 0 0 0-1-1z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgChartTrendingUp;
