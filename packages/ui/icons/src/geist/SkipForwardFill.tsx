import type { ReactElement, SVGProps } from "react";
const SvgSkipForwardFill = (props: SVGProps<SVGSVGElement>): ReactElement => (
    <svg strokeLinejoin="round" data-testid="geist-icon" viewBox="0 0 16 16" width={16} height={16} {...props}>
        <path
            fill="#fff"
            fillRule="evenodd"
            d="M11.669 8.21a.25.25 0 0 0 0-.42L1.384 1.244a.25.25 0 0 0-.384.21v13.09a.25.25 0 0 0 .384.21L11.67 8.212zM15 2v-.75h-1.5v13.5H15z"
            clipRule="evenodd"
        />
    </svg>
);
export default SvgSkipForwardFill;
