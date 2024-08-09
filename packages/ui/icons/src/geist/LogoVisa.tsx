import type { ReactElement, SVGProps } from "react";
const SvgLogoVisa = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <g clipPath="url(#logo-visa_svg__a)">
            <path fill="color(display-p3 .0784 .2039 .7961)" d="M0 0h16v16H0z" />
            <path
                fill="url(#logo-visa_svg__b)"
                d="M9.708 4.444 7.86 9.22l-.77-4.063c-.103-.457-.462-.712-.821-.712H3.607l-.051.204c.616.152 1.079.304 1.49.508.127.064.234.177.299.66l1.334 5.74h1.899l2.978-7.112H9.708z"
            />
        </g>
        <defs>
            <linearGradient
                id="logo-visa_svg__b"
                x1={68.2}
                x2={69.6}
                y1={96.4}
                y2={40.9}
                gradientUnits="userSpaceOnUse"
            >
                <stop offset={1} stopColor="#fff" />
            </linearGradient>
            <clipPath id="logo-visa_svg__a">
                <rect width={16} height={16} fill="#fff" rx={2} />
            </clipPath>
        </defs>
    </svg>
);
export default SvgLogoVisa;
