import type { ReactElement, SVGProps } from "react";
const SvgCloud = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            d="m12 6.509-.75-.001v.7l.697.049zm0-.009h.75zm-8 0h-.75zm0 .009.053.748.698-.05-.001-.699zm.25 6.241A2.75 2.75 0 0 1 1.5 10H0a4.25 4.25 0 0 0 4.25 4.25zm7.5 0h-7.5v1.5h7.5zM14.5 10a2.75 2.75 0 0 1-2.75 2.75v1.5A4.25 4.25 0 0 0 16 10zm-2.553-2.743A2.75 2.75 0 0 1 14.5 10H16a4.25 4.25 0 0 0-3.947-4.24zm-.697-.758v.009l1.5.002V6.5h-1.5zM8 3.25a3.25 3.25 0 0 1 3.25 3.25h1.5A4.75 4.75 0 0 0 8 1.75zM4.75 6.5A3.25 3.25 0 0 1 8 3.25v-1.5A4.75 4.75 0 0 0 3.25 6.5zm0 .008v-.009l-1.5.002v.009zM1.5 10a2.75 2.75 0 0 1 2.553-2.743L3.947 5.76A4.25 4.25 0 0 0 0 10z"
        />
    </svg>
);
export default SvgCloud;
