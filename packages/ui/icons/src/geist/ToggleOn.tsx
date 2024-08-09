import type { ReactElement, SVGProps } from "react";
const SvgToggleOn = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M7.43 11.5A4.98 4.98 0 0 1 6 8a4.98 4.98 0 0 1 1.43-3.5H5a3.5 3.5 0 1 0 0 7zM0 8a5 5 0 0 1 5-5h6a5 5 0 0 1 0 10H5a5 5 0 0 1-5-5"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgToggleOn;
