import type { ReactElement, SVGProps } from "react";
const SvgFullscreenClose = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M6 1v4a1 1 0 0 1-1 1H1V4.5h3.5V1zm8.25 5H15V4.5h-3.5V1H10v4a1 1 0 0 0 1 1zM10 14.25V15h1.5v-3.5h3.54V10H11a1 1 0 0 0-1 1zM1.75 10H1v1.5h3.5V15H6v-4a1 1 0 0 0-1-1z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgFullscreenClose;
