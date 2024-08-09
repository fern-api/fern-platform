import type { ReactElement, SVGProps } from "react";
const SvgDownload = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M8.75 1v7.69l1.97-1.97.53-.53 1.06 1.06-.53.53-3.073 3.074a1 1 0 0 1-1.414 0L4.22 7.78l-.53-.53 1.06-1.06.53.53 1.97 1.97V1zm4.75 8.25v4.25h-11v-5H1V14a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8.5h-1.5z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgDownload;
