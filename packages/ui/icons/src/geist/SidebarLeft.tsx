import type { ReactElement, SVGProps } from "react";
const SvgSidebarLeft = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M6.245 2.5H14.5v10a1 1 0 0 1-1 1H6.245zm-1.25 0H1.5v10a1 1 0 0 0 1 1h2.495zM0 1h16v11.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 0 12.5z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgSidebarLeft;
