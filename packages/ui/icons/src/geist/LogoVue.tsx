import type { ReactElement, SVGProps } from "react";
const SvgLogoVue = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <g clipPath="url(#logo-vue_svg__a)">
            <path fill="#41B883" d="m9.72.917-1.848 3.2-1.848-3.2H-.128l8 13.856 8-13.856H9.719z" />
            <path fill="#34495E" d="m9.72.917-1.848 3.2-1.848-3.2H3.072l4.8 8.313 4.8-8.313H9.719z" />
        </g>
        <defs>
            <clipPath id="logo-vue_svg__a">
                <path fill="#fff" d="M0 0h16v16H0z" />
            </clipPath>
        </defs>
    </svg>
);
export default SvgLogoVue;
