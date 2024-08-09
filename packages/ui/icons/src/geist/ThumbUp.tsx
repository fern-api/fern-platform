import type { ReactElement, SVGProps } from "react";
const SvgThumbUp = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M6.895 2.24a.25.25 0 0 0-.395.203V5.25A1.75 1.75 0 0 1 4.75 7H2.5v6.5h9.688a1.25 1.25 0 0 0 1.213-.947l1-4A1.25 1.25 0 0 0 13.188 7H8.5V3.515a.25.25 0 0 0-.105-.204zM5 2.443C5 1.02 6.609.192 7.767 1.02l1.5 1.072c.46.328.733.858.733 1.424V5.5h3.188a2.75 2.75 0 0 1 2.668 3.417l-1 4A2.75 2.75 0 0 1 12.188 15H1V5.5h3.75A.25.25 0 0 0 5 5.25z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgThumbUp;
