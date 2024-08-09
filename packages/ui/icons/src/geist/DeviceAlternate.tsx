import type { ReactElement, SVGProps } from "react";
const SvgDeviceAlternate = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M1 3.25A3.25 3.25 0 0 1 4.25 0h7.5A3.25 3.25 0 0 1 15 3.25V16H1zM4.25 1.5A1.75 1.75 0 0 0 2.5 3.25V14.5h11V3.25a1.75 1.75 0 0 0-1.75-1.75zM4 4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v6H4zm5 9h3v-1.5H9z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgDeviceAlternate;
