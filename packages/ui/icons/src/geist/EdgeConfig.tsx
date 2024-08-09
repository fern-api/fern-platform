import type { ReactElement, SVGProps } from "react";
const SvgEdgeConfig = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 16" width={16} height={16} {...props}>
            <g clipPath="url(#edge-config_svg__a)">
                <circle cx={8} cy={6} r={1.3} fill="#fff" />
                <path
                    stroke="#fff"
                    strokeLinecap="square"
                    strokeWidth={1.5}
                    d="M8 10.5v2.349c0 .587-.174 1.162-.5 1.651m-4 0a1.75 1.75 0 0 1-1.75-1.75V9.955C1.75 8.878 1 8.25 0 8.25c1 0 1.75-.628 1.75-1.706V3.75C1.75 2.784 2.534 2 3.5 2m9 0c.966 0 1.75.784 1.75 1.75v2.794c0 1.078.75 1.706 1.75 1.706-1 0-1.75.628-1.75 1.706v2.794a1.75 1.75 0 0 1-1.75 1.75"
                />
            </g>
            <defs>
                <clipPath id="edge-config_svg__a">
                    <path fill="#fff" d="M0 0h16v16H0z" />
                </clipPath>
            </defs>
        </svg>
    </svg>
);
export default SvgEdgeConfig;
