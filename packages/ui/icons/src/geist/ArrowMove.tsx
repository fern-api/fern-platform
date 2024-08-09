import type { ReactElement, SVGProps } from "react";
const SvgArrowMove = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            d="M4.94 3 7.292.646a1 1 0 0 1 1.414 0L11.061 3 10 4.06 8.75 2.81v4.44h4.44L11.94 6 13 4.94l2.354 2.353a1 1 0 0 1 0 1.414L13 11.061 11.94 10l1.25-1.25H8.75v4.44L10 11.94 11.06 13l-2.353 2.354a1 1 0 0 1-1.414 0L4.939 13 6 11.94l1.25 1.25V8.75H2.81L4.06 10 3 11.06.646 8.708a1 1 0 0 1 0-1.414L3 4.939 4.06 6 2.81 7.25h4.44V2.81L6 4.06z"
        />
    </svg>
);
export default SvgArrowMove;
