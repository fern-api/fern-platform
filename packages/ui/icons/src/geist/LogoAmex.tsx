import type { ReactElement, SVGProps } from "react";
const SvgLogoAmex = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <g clipPath="url(#logo-amex_svg__a)">
            <rect width={16} height={16} fill="color(display-p3 .0039 .4353 .8157)" rx={2} />
            <path fill="#fff" d="M7.1 2.5H16v11H6.5v-5H4.4z" />
            <path
                fill="color(display-p3 .0039 .4353 .8157)"
                fillRule="evenodd"
                d="M7.793 3.5 6 7.5h1.23l.338-.801h1.833l.339.801H11l-1.786-4h-1.42zm.154 2.301.538-1.273.537 1.273zM7.5 8.5v4h4.875l1.123-1.28 1.136 1.28H16v-.056l-1.787-1.946L16 8.53V8.5h-1.352l-1.12 1.268L12.414 8.5zm3.5 0 1.825 1.998L11 12.5v-.932H8.633v-.615h2.31v-.906h-2.31v-.626H11zm0-5v3.99h1.05V4.75l.996 2.74h.944l.976-2.731V7.5L16 7.49V3.5h-1.607l-.865 2.46-.859-2.454z"
                clipRule="evenodd"
            />
        </g>
        <defs>
            <clipPath id="logo-amex_svg__a">
                <rect width={16} height={16} fill="#fff" rx={2} />
            </clipPath>
        </defs>
    </svg>
);
export default SvgLogoAmex;
