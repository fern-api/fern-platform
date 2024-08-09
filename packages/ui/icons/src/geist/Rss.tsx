import type { ReactElement, SVGProps } from "react";
const SvgRss = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M1 2.5c6.904 0 12.5 5.596 12.5 12.5H15C15 7.268 8.732 1 1 1zM8 15a7 7 0 0 0-7-7V6.5A8.5 8.5 0 0 1 9.5 15zm-5.5 0A1.5 1.5 0 0 0 1 13.5V12a3 3 0 0 1 3 3z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgRss;
