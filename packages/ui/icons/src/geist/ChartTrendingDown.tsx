import type { ReactElement, SVGProps } from "react";
const SvgChartTrendingDown = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M13.438 11.5h-3.364V13H15a1 1 0 0 0 1-1V7.075h-1.5v3.364L9.207 5.148a1 1 0 0 0-1.414 0L5.5 7.438 1.78 3.72l-.53-.53L.19 4.25l.53.53 4.073 4.074a1 1 0 0 0 1.414 0L8.5 6.562z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgChartTrendingDown;
