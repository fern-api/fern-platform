import type { ReactElement, SVGProps } from "react";
const SvgChartPie = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M14.457 8.75A6.501 6.501 0 1 1 7.25 1.543V7.75a1 1 0 0 0 1 1zm0-1.5H8.75V1.543a6.5 6.5 0 0 1 5.707 5.707M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgChartPie;
