import type { ReactElement, SVGProps } from "react";
const SvgDataPointMedium = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M11.25 9.75a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5m-4.5 2.75a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5"
            clipRule="evenodd"
        />
        <circle cx={6.8} cy={5.3} r={1.8} fill="#fff" opacity={0.3} />
    </svg>
);
export default SvgDataPointMedium;
