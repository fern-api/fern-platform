import type { ReactElement, SVGProps } from "react";
const SvgToggleOff = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M8.57 4.5H11a3.5 3.5 0 1 1 0 7H8.57A4.98 4.98 0 0 0 10 8a4.98 4.98 0 0 0-1.43-3.5M5 4.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7M0 8a5 5 0 0 1 5-5h6a5 5 0 0 1 0 10H5a5 5 0 0 1-5-5"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgToggleOff;
