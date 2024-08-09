import type { ReactElement, SVGProps } from "react";
const SvgShift = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="m8 .19.53.53 6.074 6.073c.63.63.183 1.707-.708 1.707H11V16H5V8.5H2.104c-.891 0-1.338-1.077-.708-1.707L7.47.72zM3.31 7H6.5v7.5h3V7h3.19L8 2.31z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgShift;
