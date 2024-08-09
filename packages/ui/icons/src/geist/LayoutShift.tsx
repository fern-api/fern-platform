import type { ReactElement, SVGProps } from "react";
const SvgLayoutShift = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <g clipPath="url(#layout-shift_svg__a)">
            <path
                fill="#fff"
                fillRule="evenodd"
                d="M2.25 14.5H3V16h-.75A2.25 2.25 0 0 1 0 13.75V12.5h1.5v1.25c0 .414.336.75.75.75m1.75 0h2V16H4zM6 0H4v1.5h2zM1.5 2.25V3.5H0V2.25A2.25 2.25 0 0 1 2.25 0H3v1.5h-.75a.75.75 0 0 0-.75.75m0 9.25v-3H0v3zm0-7v3H0v-3zm5 9.25A2.25 2.25 0 0 0 8.75 16h5A2.25 2.25 0 0 0 16 13.75V2.25A2.25 2.25 0 0 0 13.75 0h-5A2.25 2.25 0 0 0 6.5 2.25zm2.25.75a.75.75 0 0 1-.75-.75V2.25a.75.75 0 0 1 .75-.75h5a.75.75 0 0 1 .75.75v11.5a.75.75 0 0 1-.75.75z"
                clipRule="evenodd"
            />
        </g>
        <defs>
            <clipPath id="layout-shift_svg__a">
                <path fill="#fff" d="M0 16V0h16v16z" />
            </clipPath>
        </defs>
    </svg>
);
export default SvgLayoutShift;
