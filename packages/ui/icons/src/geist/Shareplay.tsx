import type { ReactElement, SVGProps } from "react";
const SvgShareplay = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M3.5 11.5h-2v-8h13v8h-2.75V13H15a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H1a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h3.25v-1.5zm4.708-1.188a.25.25 0 0 0-.416 0l-3.533 5.3a.25.25 0 0 0 .208.388h7.066a.25.25 0 0 0 .208-.389z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgShareplay;
