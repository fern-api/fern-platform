import type { ReactElement, SVGProps } from "react";
const SvgLogoTurborepo = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <g clipPath="url(#logo-turborepo_svg__a)">
            <path
                fill="url(#logo-turborepo_svg__b)"
                fillRule="evenodd"
                d="M8 0v2a6 6 0 0 1 .5 11.98v2.005A8 8 0 0 0 8 0m-.5 15.985V13.98a5.97 5.97 0 0 1-3.374-1.399L2.708 14A7.97 7.97 0 0 0 7.5 15.985M2 13.292A7.97 7.97 0 0 1 0 8h2c0 1.477.534 2.83 1.418 3.874l-1.417 1.418z"
                clipRule="evenodd"
            />
            <rect
                width={7}
                height={7}
                x={4.5}
                y={4.5}
                fill="transparent"
                stroke="var(--ds-gray-1000)"
                strokeWidth={2}
                rx={3.5}
            />
        </g>
        <defs>
            <linearGradient id="logo-turborepo_svg__b" x1={8.7} x2={1.8} y1={2} y2={8.8} gradientUnits="userSpaceOnUse">
                <stop stopColor="#0096FF" />
                <stop offset={1} stopColor="#FF1E56" />
            </linearGradient>
            <clipPath id="logo-turborepo_svg__a">
                <path fill="#fff" d="M0 0h16v16H0z" />
            </clipPath>
        </defs>
    </svg>
);
export default SvgLogoTurborepo;
