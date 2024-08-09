import type { ReactElement, SVGProps } from "react";
const SvgDataPointLow = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path fill="#fff" d="M8.5 10.75a1.75 1.75 0 1 1-3.5 0 1.75 1.75 0 0 1 3.5 0" />
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M6.75 7a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5m4.5 2.75a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5"
            clipRule="evenodd"
            opacity={0.3}
        />
    </svg>
);
export default SvgDataPointLow;
