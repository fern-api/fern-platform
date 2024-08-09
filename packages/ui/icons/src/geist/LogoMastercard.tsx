import type { ReactElement, SVGProps } from "react";
const SvgLogoMastercard = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <g clipPath="url(#logo-mastercard_svg__a)">
            <path d="M0 0h16v16H0z" />
            <path
                fill="color(display-p3 .9216 0 .1059)"
                d="M6.045 10.933a2.934 2.934 0 1 0 0-5.867 2.934 2.934 0 0 0 0 5.867"
            />
            <path
                fill="color(display-p3 .9686 .6196 .1059)"
                d="M9.956 10.933a2.933 2.933 0 1 0 0-5.867 2.933 2.933 0 0 0 0 5.867"
            />
            <path
                fill="color(display-p3 1 .3725 0)"
                d="M8 10.187A2.93 2.93 0 0 0 8.978 8 2.93 2.93 0 0 0 8 5.813 2.93 2.93 0 0 0 7.022 8 2.92 2.92 0 0 0 8 10.187"
            />
        </g>
        <defs>
            <clipPath id="logo-mastercard_svg__a">
                <rect width={16} height={16} fill="#fff" rx={2} />
            </clipPath>
        </defs>
    </svg>
);
export default SvgLogoMastercard;
