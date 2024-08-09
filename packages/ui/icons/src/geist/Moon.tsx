import type { ReactElement, SVGProps } from "react";
const SvgMoon = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M1.5 8c0-2.47 1.492-4.59 3.623-5.511a7 7 0 0 0 7.072 9.247A6 6 0 0 1 1.5 8M6.417.578A7.502 7.502 0 0 0 7.5 15.5a7.5 7.5 0 0 0 6.88-4.508l-.921-1.012A5.5 5.5 0 0 1 7.15 1.732zM13.25 1v1.75H15v1.5h-1.75V6h-1.5V4.25H10v-1.5h1.75V1z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgMoon;
