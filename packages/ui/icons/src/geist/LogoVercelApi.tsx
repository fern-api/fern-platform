import type { ReactElement, SVGProps } from "react";
const SvgLogoVercelApi = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <g clipPath="url(#logo-vercel-api_svg__a)">
            <path
                fill="transparent"
                fillRule="evenodd"
                stroke="#fff"
                strokeDasharray="1.25 1.25"
                strokeWidth={1.3}
                d="m8 2 7 12.5H1z"
                clipRule="evenodd"
            />
        </g>
        <defs>
            <clipPath id="logo-vercel-api_svg__a">
                <path fill="#fff" d="M0 0h16v16H0z" />
            </clipPath>
        </defs>
    </svg>
);
export default SvgLogoVercelApi;
