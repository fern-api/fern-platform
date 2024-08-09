import type { ReactElement, SVGProps } from "react";
const SvgStopFill = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M4.393.293A1 1 0 0 1 5.101 0h5.798a1 1 0 0 1 .708.293l4.1 4.1a1 1 0 0 1 .293.708v5.798a1 1 0 0 1-.293.708l-4.1 4.1A1 1 0 0 1 10.9 16H5.1a1 1 0 0 1-.707-.293l-4.1-4.1A1 1 0 0 1 0 10.9V5.1a1 1 0 0 1 .293-.707zM8.75 3.75v5h-1.5v-5zM8 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgStopFill;
