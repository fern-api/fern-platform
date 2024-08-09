import type { ReactElement, SVGProps } from "react";
const SvgGps = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="transparent"
            stroke="#fff"
            strokeLinecap="round"
            strokeLinejoin="bevel"
            strokeWidth={1.5}
            d="m1 6 14-5-5 14-2.34-6.085a1 1 0 0 0-.575-.575z"
        />
    </svg>
);
export default SvgGps;
