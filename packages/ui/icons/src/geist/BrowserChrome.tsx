import type { ReactElement, SVGProps } from "react";
const SvgBrowserChrome = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="m8.532 11.333-1.761 3.05a6.502 6.502 0 0 1-4.47-9.51l2.705 4.686a3.375 3.375 0 0 0 3.526 1.774m2.319-1.525-2.709 4.69a6.5 6.5 0 0 0 6.002-8.626H10.62A3.36 3.36 0 0 1 11.375 8a3.36 3.36 0 0 1-.524 1.808m-2.72-5.18h5.427A6.5 6.5 0 0 0 8 1.5c-1.962 0-3.722.87-4.914 2.245l1.76 3.049a3.38 3.38 0 0 1 3.285-2.166M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16M5.875 8a2.125 2.125 0 1 1 4.25 0 2.125 2.125 0 0 1-4.25 0"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgBrowserChrome;
