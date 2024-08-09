import type { ReactElement, SVGProps } from "react";
const SvgBarChart = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M1 1v11.75A2.25 2.25 0 0 0 3.25 15H15v-1.5H3.25a.75.75 0 0 1-.75-.75V1zm8.5 2.75V3H8v9h1.5zM6 8v4H4.5V8zm7-1.25V6h-1.5v6H13z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgBarChart;
