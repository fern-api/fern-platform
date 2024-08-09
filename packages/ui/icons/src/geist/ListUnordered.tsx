import type { ReactElement, SVGProps } from "react";
const SvgListUnordered = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M2.5 4a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5m0 5.25a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5m1.25 4a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0M6.75 2H6v1.5h9V2zm0 5.25H6v1.5h9v-1.5zm0 5.25H6V14h9v-1.5z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgListUnordered;
