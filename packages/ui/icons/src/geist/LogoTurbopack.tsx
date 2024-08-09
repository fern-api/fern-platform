import type { ReactElement, SVGProps } from "react";
const SvgLogoTurbopack = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <g clipPath="url(#logo-turbopack_svg__a)">
            <path
                fill="url(#logo-turbopack_svg__b)"
                fillRule="evenodd"
                d="M0 2.993V13c0 .648.205 1.248.555 1.738l1.479-1.479A1 1 0 0 1 2 13V8H0zM8 2h5a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H8.5v2H13a3 3 0 0 0 3-3V3a3 3 0 0 0-3-3H8zm-.5 14v-2H3q-.135 0-.259-.034l-1.48 1.48A3 3 0 0 0 3 16z"
                clipRule="evenodd"
            />
            <mask id="logo-turbopack_svg__c" fill="#fff">
                <rect width={9} height={9} x={3.5} y={3.5} rx={0.5} />
            </mask>
            <rect
                width={9}
                height={9}
                x={3.5}
                y={3.5}
                fill="transparent"
                stroke="var(--ds-gray-1000)"
                strokeWidth={4}
                mask="url(#logo-turbopack_svg__c)"
                rx={0.5}
            />
        </g>
        <defs>
            <linearGradient id="logo-turbopack_svg__b" x1={8.7} x2={1.8} y1={2} y2={8.8} gradientUnits="userSpaceOnUse">
                <stop stopColor="#0096FF" />
                <stop offset={1} stopColor="#FF1E56" />
            </linearGradient>
            <clipPath id="logo-turbopack_svg__a">
                <path fill="#fff" d="M0 0h16v16H0z" />
            </clipPath>
        </defs>
    </svg>
);
export default SvgLogoTurbopack;
