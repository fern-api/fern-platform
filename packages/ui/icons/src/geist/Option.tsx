import type { ReactElement, SVGProps } from "react";
const SvgOption = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M.75 3.5H0V5h4.365a.75.75 0 0 1 .657.387l4.394 7.951a2.25 2.25 0 0 0 1.969 1.162H16V13h-4.615a.75.75 0 0 1-.657-.387L6.334 4.662A2.25 2.25 0 0 0 4.365 3.5zm11 0H11V5h5V3.5z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgOption;
