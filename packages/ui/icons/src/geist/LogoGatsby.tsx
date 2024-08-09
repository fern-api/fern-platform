import type { ReactElement, SVGProps } from "react";
const SvgLogoGatsby = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <g clipPath="url(#logo-gatsby_svg__a)">
            <path
                fill="#639"
                d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8M3.543 12.457c-1.2-1.2-1.829-2.8-1.829-4.343l6.229 6.172c-1.6-.057-3.2-.629-4.4-1.829m5.828 1.657L1.886 6.63C2.514 3.829 5.029 1.714 8 1.714a6.3 6.3 0 0 1 5.086 2.572l-.857.743C11.257 3.714 9.714 2.857 8 2.857c-2.229 0-4.114 1.429-4.857 3.429l6.571 6.571c1.657-.571 2.915-2 3.315-3.714h-2.743V8h4c0 2.971-2.115 5.486-4.915 6.114"
            />
        </g>
        <defs>
            <clipPath id="logo-gatsby_svg__a">
                <path fill="#fff" d="M0 0h16v16H0z" />
            </clipPath>
        </defs>
    </svg>
);
export default SvgLogoGatsby;
