import type { ReactElement, SVGProps } from "react";
const SvgShieldGlobe = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="transparent"
            stroke="#fff"
            strokeLinecap="square"
            strokeWidth={1.5}
            d="M11.25 4.25V3.5C9.35 2.867 6 2.59 6 0 6 2.59 2.65 2.867.75 3.5v6.027a4.5 4.5 0 0 0 2.412 3.986l1.338.701"
        />
        <circle cx={11.5} cy={11.5} r={3.9} fill="transparent" stroke="#fff" strokeLinecap="round" strokeWidth={1.3} />
        <path
            stroke="#fff"
            strokeLinejoin="bevel"
            d="M8 11.5h7.25m-4.5 3.5a12.74 12.74 0 0 1 0-7m1.5 7a12.74 12.74 0 0 0 0-7"
        />
    </svg>
);
export default SvgShieldGlobe;
