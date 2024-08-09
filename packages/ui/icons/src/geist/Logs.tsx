import type { ReactElement, SVGProps } from "react";
const SvgLogs = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M9 2h6v1.5H9zm0 10.5h6V14H9zm.75-5.25H9v1.5h6v-1.5zM1 12.5h2V14H1zM1.75 2H1v1.5h2V2zM1 7.25h2v1.5H1zm4.75 5.25H5V14h2v-1.5zM5 2h2v1.5H5zm.75 5.25H5v1.5h2v-1.5z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgLogs;
