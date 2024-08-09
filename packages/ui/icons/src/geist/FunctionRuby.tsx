import type { ReactElement, SVGProps } from "react";
const SvgFunctionRuby = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            stroke="#fff"
            strokeWidth={1.5}
            d="M15.25 8V2.25a1.5 1.5 0 0 0-1.5-1.5H2.25a1.5 1.5 0 0 0-1.5 1.5v11.5a1.5 1.5 0 0 0 1.5 1.5H8"
        />
        <path
            stroke="#fff"
            strokeLinecap="square"
            strokeWidth={1.5}
            d="M9.246 4.25v0A2.246 2.246 0 0 0 7 6.496v3.008a2.246 2.246 0 0 1-2.246 2.246v0m.496-4h3.5"
        />
        <path
            fill="color(display-p3 .7922 .1647 .1882)"
            d="m15.725 11.386-1.177-1.338h-4.096l-1.177 1.338a1 1 0 0 0 .05 1.373l3.175 3.118 3.175-3.118a1 1 0 0 0 .05-1.373"
        />
        <path
            fill="color(display-p3 .9725 .4471 .4549)"
            fillRule="evenodd"
            d="M12.466 9.488c1.203.005 2.334.429 2.331 1.029s-1.052 1.016-2.255 1.012-2.344-.4-2.34-1c.002-.6 1.062-1.045 2.264-1.04z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgFunctionRuby;
