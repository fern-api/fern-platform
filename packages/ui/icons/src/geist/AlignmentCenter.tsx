import type { ReactElement, SVGProps } from "react";
const SvgAlignmentCenter = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M1.75 2H1v1.5h14V2zM3.5 7.25h9v1.5h-9zm-1 5.25h11V14h-11z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgAlignmentCenter;
