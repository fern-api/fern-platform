import type { ReactElement, SVGProps } from "react";
const SvgMoonAlternate = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <g clipPath="url(#moon-alternate_svg__a)">
            <path
                fill="#fff"
                fillRule="evenodd"
                d="M14.5 8A6.5 6.5 0 0 1 1.645 9.372c.167.404.407.772.723 1.088 1.678 1.678 4.851 1.226 7.088-1.01 2.236-2.237 2.688-5.41 1.01-7.089a3.3 3.3 0 0 0-1.051-.707A6.5 6.5 0 0 1 14.5 8M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0"
                clipRule="evenodd"
            />
        </g>
        <defs>
            <clipPath id="moon-alternate_svg__a">
                <path fill="#fff" d="M0 0h16v16H0z" />
            </clipPath>
        </defs>
    </svg>
);
export default SvgMoonAlternate;
