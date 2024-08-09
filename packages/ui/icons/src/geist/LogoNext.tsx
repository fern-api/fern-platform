import type { ReactElement, SVGProps } from "react";
const SvgLogoNext = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <g clipPath="url(#logo-next_svg__a)">
            <circle cx={8} cy={8} r={7.4} stroke="var(--ds-gray-1000)" strokeLinecap="round" />
            <path stroke="url(#logo-next_svg__b)" strokeMiterlimit={1.4} d="M10.63 11V5" />
            <path
                fill="url(#logo-next_svg__c)"
                fillRule="evenodd"
                d="M5.995 5h-1.25v6h1.25V6.968l6.366 7.74a8 8 0 0 0 .992-.763L5.995 5.001z"
            />
        </g>
        <defs>
            <linearGradient id="logo-next_svg__b" x1={11.1} x2={11.1} y1={5} y2={11} gradientUnits="userSpaceOnUse">
                <stop stopColor="#fff" />
                <stop offset={0.6} stopColor="#fff" stopOpacity={0.6} />
                <stop offset={0.8} stopColor="#fff" stopOpacity={0} />
                <stop offset={1} stopColor="#fff" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="logo-next_svg__c" x1={9.9} x2={13.6} y1={9.1} y2={13.4} gradientUnits="userSpaceOnUse">
                <stop stopColor="#fff" />
                <stop offset={1} stopColor="#fff" stopOpacity={0} />
            </linearGradient>
            <clipPath id="logo-next_svg__a">
                <path fill="red" d="M0 0h16v16H0z" />
            </clipPath>
        </defs>
    </svg>
);
export default SvgLogoNext;
