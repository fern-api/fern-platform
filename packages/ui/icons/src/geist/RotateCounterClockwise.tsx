import type { ReactElement, SVGProps } from "react";
const SvgRotateCounterClockwise = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M13.5 8c0-3.034-2.474-5.5-5.535-5.5a5.53 5.53 0 0 0-5.328 4H6V8H.75A.75.75 0 0 1 0 7.25V2h1.5v3.233A7.04 7.04 0 0 1 7.965 1C11.846 1 15 4.13 15 8s-3.154 7-7.035 7a7.04 7.04 0 0 1-5.695-2.888l-.442-.605 1.211-.885.443.605A5.54 5.54 0 0 0 7.965 13.5c3.06 0 5.535-2.466 5.535-5.5"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgRotateCounterClockwise;
