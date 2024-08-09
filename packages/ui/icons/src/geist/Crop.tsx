import type { ReactElement, SVGProps } from "react";
const SvgCrop = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M5 .75V0H3.5v3.5H0V5h3.5v6.5a1 1 0 0 0 1 1H11V16h1.5v-3.5H16V11h-3.5V4.5a1 1 0 0 0-1-1H5zM5 5v6h6V5z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgCrop;
