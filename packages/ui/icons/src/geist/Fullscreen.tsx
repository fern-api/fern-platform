import type { ReactElement, SVGProps } from "react";
const SvgFullscreen = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M1 5.25V6h1.5V2.5H6V1H2a1 1 0 0 0-1 1zM5.25 15H6v-1.5H2.5V10H1v4a1 1 0 0 0 1 1zM15 10v4a1 1 0 0 1-1 1h-4v-1.5h3.5V10zm-4.25-9H10v1.5h3.5V6H15V2a1 1 0 0 0-1-1z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgFullscreen;
