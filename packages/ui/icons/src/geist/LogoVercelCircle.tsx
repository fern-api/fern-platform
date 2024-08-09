import type { ReactElement, SVGProps } from "react";
const SvgLogoVercelCircle = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <g clipPath="url(#logo-vercel-circle_svg__a)">
            <circle cx={8} cy={8} r={7.3} fill="#fff" stroke="#fff" strokeLinecap="round" strokeWidth={1.5} />
            <path fill="var(--ds-gray-100)" fillRule="evenodd" d="m8 4.5 3.5 6.125h-7z" clipRule="evenodd" />
        </g>
        <defs>
            <clipPath id="logo-vercel-circle_svg__a">
                <path fill="#fff" d="M0 0h16v16H0z" />
            </clipPath>
        </defs>
    </svg>
);
export default SvgLogoVercelCircle;
