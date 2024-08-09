import type { ReactElement, SVGProps } from "react";
const SvgBookClosed = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M3.75 0A2.25 2.25 0 0 0 1.5 2.25v11.5a2.25 2.25 0 0 0 2.25 2.244H14.5V0zM13 11.494V1.5H3.75a.75.75 0 0 0-.75.75v9.372q.354-.126.75-.128zm-10 2.25c0 .414.336.75.75.75H13v-1.5H3.75a.75.75 0 0 0-.75.75"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgBookClosed;
