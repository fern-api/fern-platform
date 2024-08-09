import type { ReactElement, SVGProps } from "react";
const SvgAsterisk = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M7.25 15v-3.969a1 1 0 0 0-1.5-.866L2.313 12.15l-.75-1.3L5 8.867a1 1 0 0 0 0-1.732L1.563 5.15l.75-1.3L5.75 5.835a1 1 0 0 0 1.5-.866V1h1.5v3.969a1 1 0 0 0 1.5.866l3.437-1.985.75 1.3L11 7.134a1 1 0 0 0 0 1.732l3.437 1.985-.75 1.298-3.437-1.984a1 1 0 0 0-1.5.866V15z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgAsterisk;
