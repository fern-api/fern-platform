import type { ReactElement, SVGProps } from "react";
const SvgSunAlternate = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <g clipPath="url(#sun-alternate_svg__a)">
            <path
                fill="#fff"
                fillRule="evenodd"
                d="M13.81 13.5a8 8 0 0 0 1.12-1.5H1.07a8 8 0 0 0 1.12 1.5zM15.938 9a8 8 0 0 1-.52 2H.582a8 8 0 0 1-.52-2zM16 8.064V8A8 8 0 1 0 0 8h16zM3.335 14.5A7.96 7.96 0 0 0 8 16c1.74 0 3.352-.556 4.665-1.5z"
                clipRule="evenodd"
            />
        </g>
        <defs>
            <clipPath id="sun-alternate_svg__a">
                <path fill="var(--ds-background-100)" d="M0 0h16v16H0z" />
            </clipPath>
        </defs>
    </svg>
);
export default SvgSunAlternate;
