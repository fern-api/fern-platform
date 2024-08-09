import type { ReactElement, SVGProps } from "react";
const SvgTabs = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M13.5 13.5a1 1 0 0 0 1-1V7H9.15a2.5 2.5 0 0 1-2.285-1.485L5.525 2.5H1.5v10a1 1 0 0 0 1 1zm-6.333-11 1.07 2.406a1 1 0 0 0 .913.594h5.35v-3zM13.5 15a2.5 2.5 0 0 0 2.5-2.5V1H0v11.5A2.5 2.5 0 0 0 2.5 15z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgTabs;
