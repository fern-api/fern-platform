import type { ReactElement, SVGProps } from "react";
const SvgPlayFill = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M14.553 7.776a.25.25 0 0 1 0 .448L1.362 14.819A.25.25 0 0 1 1 14.595V1.405a.25.25 0 0 1 .362-.224l13.19 6.595z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgPlayFill;
