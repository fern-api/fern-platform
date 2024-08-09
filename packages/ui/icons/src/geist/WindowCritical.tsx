import type { ReactElement, SVGProps } from "react";
const SvgWindowCritical = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M.75 1H0v10.5A2.5 2.5 0 0 0 2.5 14h2.75v-1.5H2.5a1 1 0 0 1-1-1v-9h13V7H16V1zm3 4.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5M7 4.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0m1.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5"
            clipRule="evenodd"
        />
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M10.25 11h2.5V9.5a1.25 1.25 0 1 0-2.5 0zM9 11H8v3.65c0 .746.604 1.35 1.35 1.35h4.3A1.35 1.35 0 0 0 15 14.65V11h-1V9.5a2.5 2.5 0 0 0-5 0z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgWindowCritical;
