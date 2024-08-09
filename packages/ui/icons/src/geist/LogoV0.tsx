import type { ReactElement, SVGProps } from "react";
const SvgLogoV0 = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M9.503 5.5h3.75q.09 0 .174.012L9.512 9.427A1 1 0 0 1 9.5 9.25V5.5H8v3.75A2.75 2.75 0 0 0 10.75 12h3.75v-1.5h-3.75q-.09 0-.177-.012L14.49 6.57q.013.088.013.18v3.75h1.5V6.75A2.75 2.75 0 0 0 13.253 4h-3.75zM0 5v.004l5.125 6.527c.616.784 1.876.348 1.876-.649V5h-1.5v4.58L1.904 5z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgLogoV0;
