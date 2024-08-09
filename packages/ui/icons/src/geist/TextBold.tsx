import type { ReactElement, SVGProps } from "react";
const SvgTextBold = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M3 1H2v14h8a4 4 0 0 0 2.063-7.428A4 4 0 0 0 9 1zm6 6a2 2 0 1 0 0-4H4v4zM4 9v4h6a2 2 0 1 0 0-4z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgTextBold;
