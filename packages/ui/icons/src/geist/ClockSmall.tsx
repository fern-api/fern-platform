import type { ReactElement, SVGProps } from "react";
const SvgClockSmall = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M13.014 8a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0m1.5 0a6 6 0 1 1-12 0 6 6 0 0 1 12 0m-5.25-2.25V5h-1.5v3.75h1.5z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgClockSmall;
