import type { ReactElement, SVGProps } from "react";
const SvgDelta = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M2.677 15H1l.75-1.5 4.411-8.823-.003-.006.009-.004.994-1.99L8 1l.839 1.677L14.25 13.5 15 15zM7 6.354l3.573 7.146H3.427z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgDelta;
