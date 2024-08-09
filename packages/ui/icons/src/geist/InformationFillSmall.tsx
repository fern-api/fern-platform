import type { ReactElement, SVGProps } from "react";
const SvgInformationFillSmall = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path fill="#fff" fillOpacity={0.1} d="M14 8A6 6 0 1 1 2 8a6 6 0 0 1 12 0" />
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M8 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2M7 7h-.75v1.5h1v2.75h1.5V8a1 1 0 0 0-1-1z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgInformationFillSmall;
